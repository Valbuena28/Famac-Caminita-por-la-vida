import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePatientDto } from './dto/create-patient.dto';

@Injectable()
export class PatientsService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreatePatientDto) {
    const { medicalRecord, familyBackgrounds, familyMembers, socialReport, ...patientData } = data;

    const patient = await this.prisma.patient.create({
      data: {
        ...patientData,
        dateOfBirth: new Date(patientData.dateOfBirth),
        
        // Nested Creation
        ...(medicalRecord && {
          medicalRecords: {
            create: {
              diagnosis: medicalRecord.diagnosis,
              treatingDoctor: medicalRecord.treatingDoctor,
              surgeryType: medicalRecord.surgeryType,
              indicatedTreatment: medicalRecord.indicatedTreatment,
              observations: medicalRecord.observations,
              ...(medicalRecord.surgeryDate && { surgeryDate: new Date(medicalRecord.surgeryDate) }),
              ...(medicalRecord.chemotherapies && {
                chemotherapies: {
                  create: medicalRecord.chemotherapies.map(c => ({
                    ...c,
                    startDate: new Date(c.startDate),
                    ...(c.endDate && { endDate: new Date(c.endDate) })
                  }))
                }
              })
            }
          }
        }),

        ...(familyBackgrounds && familyBackgrounds.length > 0 && {
          familyBackground: {
            create: familyBackgrounds.map(fb => ({
              ...fb,
              date: new Date(fb.date)
            }))
          }
        }),

        ...(familyMembers && familyMembers.length > 0 && {
          familyMembers: {
             create: familyMembers
          }
        }),

        ...(socialReport && {
          socialReport: {
            create: socialReport
          }
        })
      },
      include: {
        medicalRecords: { include: { chemotherapies: true } },
        familyBackground: true,
        familyMembers: true,
        socialReport: true
      }
    });

    await this.prisma.auditLog.create({
      data: {
        action: 'Apertura de Nuevo Expediente Clínico',
        user: 'Operador Principal',
        target: `Paciente Registrado: ${patient.firstName} ${patient.lastName}`,
        severity: 'success'
      }
    });

    return patient;
  }

  async findAll(search?: string) {
    return this.prisma.patient.findMany({
      where: search ? {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { ci: { contains: search, mode: 'insensitive' } },
        ]
      } : undefined,
      include: {
        medicalRecords: { include: { chemotherapies: true } },
        familyBackground: true,
        familyMembers: true,
        socialReport: true
      },
      orderBy: { fileNumber: 'asc' }
    });
  }

  async findOne(id: string) {
    const patient = await this.prisma.patient.findUnique({
      where: { id },
      include: {
        medicalRecords: { include: { chemotherapies: true } },
        familyBackground: true,
        familyMembers: true,
        socialReport: true
      }
    });
    if (!patient) throw new NotFoundException('Patient not found');
    return patient;
  }

  async update(id: string, data: CreatePatientDto) {
    const { medicalRecord, familyBackgrounds, familyMembers, socialReport, ...patientData } = data;

    // Ejecutar reconstrucción transaccional segura sin destructividad (Wipe Avoidance)
    return this.prisma.$transaction(async (tx) => {
      
      // 1. Update Core Patient Fields (Non-destructive)
      const patient = await tx.patient.update({
        where: { id },
        data: {
          ...patientData,
          dateOfBirth: new Date(patientData.dateOfBirth),
          ...(socialReport && {
             socialReport: {
                upsert: {
                   create: socialReport,
                   update: socialReport
                }
             }
          })
        }
      });

      // 2. Safe Synchronize Medical Record
      if (medicalRecord) {
         const existingMedical = await tx.medicalRecord.findFirst({ where: { patientId: id } });
         
         if (existingMedical) {
            await tx.medicalRecord.update({
               where: { id: existingMedical.id },
               data: {
                 diagnosis: medicalRecord.diagnosis,
                 treatingDoctor: medicalRecord.treatingDoctor,
                 surgeryType: medicalRecord.surgeryType,
                 indicatedTreatment: medicalRecord.indicatedTreatment,
                 observations: medicalRecord.observations,
                 ...(medicalRecord.surgeryDate && { surgeryDate: new Date(medicalRecord.surgeryDate) }),
               }
            });

            // Re-sync Chemotherapies Non-Destructively (Upsert by creating missing ones after clearing orphaned)
            if (medicalRecord.chemotherapies && medicalRecord.chemotherapies.length > 0) {
               await tx.chemotherapy.deleteMany({ where: { medicalRecordId: existingMedical.id } });
               await tx.chemotherapy.createMany({
                 data: medicalRecord.chemotherapies.map(c => ({
                   ...c,
                   medicalRecordId: existingMedical.id,
                   startDate: new Date(c.startDate),
                   ...(c.endDate && { endDate: new Date(c.endDate) })
                 }))
               });
            }
         } else {
            await tx.medicalRecord.create({
               data: {
                 patientId: id,
                 diagnosis: medicalRecord.diagnosis,
                 treatingDoctor: medicalRecord.treatingDoctor,
                 surgeryType: medicalRecord.surgeryType,
                 indicatedTreatment: medicalRecord.indicatedTreatment,
                 observations: medicalRecord.observations,
                 ...(medicalRecord.surgeryDate && { surgeryDate: new Date(medicalRecord.surgeryDate) }),
                 ...(medicalRecord.chemotherapies && medicalRecord.chemotherapies.length > 0 && {
                    chemotherapies: {
                      create: medicalRecord.chemotherapies.map(c => ({
                        ...c,
                        startDate: new Date(c.startDate),
                        ...(c.endDate && { endDate: new Date(c.endDate) })
                      }))
                    }
                 })
               }
            });
         }
      }

      // 3. Safe Sync Family Backgrounds (Aids)
      if (familyBackgrounds && familyBackgrounds.length > 0) {
        // En aplicaciones clínicas reales sin IDs front-end, se limpia el arreglo subordinado menor 
        // pero NO en un casacade destructivo que bote otros registros.
        await tx.familyBackground.deleteMany({ where: { patientId: id } });
        await tx.familyBackground.createMany({
           data: familyBackgrounds.map(fb => ({
             ...fb,
             patientId: id,
             date: new Date(fb.date)
           }))
        });

        await tx.auditLog.create({
          data: {
            action: 'Actualización de Ayudas Aprobadas',
            user: 'Operador Principal',
            target: `Expediente: ${patient.firstName} ${patient.lastName}`,
            severity: 'success'
          }
        });
      }

      // 4. Safe Sync Family Members
      if (familyMembers && familyMembers.length > 0) {
        await tx.familyMember.deleteMany({ where: { patientId: id } });
        await tx.familyMember.createMany({
           data: familyMembers.map(f => ({
             ...f,
             patientId: id
           }))
        });
      }

      await tx.auditLog.create({
        data: {
          action: data.isDeceased ? 'Marcaje de Deceso Irreversible' : 'Modificación de Expediente',
          user: 'Operador Principal',
          target: `Paciente Afectado: ${patient.firstName} ${patient.lastName}`,
          severity: data.isDeceased ? 'critical' : 'info'
        }
      });

      return patient;
    });
  }

  async markAsDeceased(id: string, deceasedData: any) {
    return this.prisma.deceasedRecord.create({
      data: {
        ...deceasedData,
        patientId: id
      }
    });
  }
}
