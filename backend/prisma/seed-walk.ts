import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });

async function seedWalkData() {
  console.log('🚶 Sembrando datos de prueba del módulo Caminata FAMAC...\n');

  // 1. Crear evento de caminata activo
  const walkEvent = await prisma.walkEvent.create({
    data: {
      name: 'Caminata Rosa 2026',
      year: 2026,
      goalAmount: 50000.00,
      status: 'ACTIVE',
      startDate: new Date('2026-10-15'),
      endDate: new Date('2026-10-15'),
    },
  });
  console.log(`✅ Evento creado: ${walkEvent.name} (Meta: Bs 50,000)`);

  // 2. Crear puntos de venta (Puntos Rosas)
  const posData = [
    { name: 'C.C. Sambil Maracaibo', location: 'Av. La Limpia, Maracaibo', contactName: 'María González', contactPhone: '0414-6521234' },
    { name: 'Plaza de la República', location: 'Av. 5 de Julio, Centro', contactName: 'Ana Rodríguez', contactPhone: '0424-6987654' },
    { name: 'C.C. Lago Mall', location: 'Av. El Milagro', contactName: 'Carmen López', contactPhone: '0412-7654321' },
    { name: 'Sede FAMAC Principal', location: 'Calle 72 con Av. 15, Maracaibo', contactName: 'Luisa Pérez', contactPhone: '0414-6112233' },
    { name: 'Plaza Baralt', location: 'Centro Histórico, Maracaibo', contactName: 'Rosa Martínez', contactPhone: '0424-6223344' },
  ];

  const pointsOfSale = [];
  for (const pos of posData) {
    const created = await prisma.pointOfSale.create({
      data: pos,
    });
    pointsOfSale.push(created);
  }
  console.log(`✅ ${pointsOfSale.length} Puntos de Venta creados`);

  // 3. Crear inventario
  const inventoryData = [
    { name: 'Camisa Rosa - Talla S', type: 'SHIRT', size: 'S', unitPrice: 15.00, totalQty: 200 },
    { name: 'Camisa Rosa - Talla M', type: 'SHIRT', size: 'M', unitPrice: 15.00, totalQty: 350 },
    { name: 'Camisa Rosa - Talla L', type: 'SHIRT', size: 'L', unitPrice: 15.00, totalQty: 300 },
    { name: 'Camisa Rosa - Talla XL', type: 'SHIRT', size: 'XL', unitPrice: 15.00, totalQty: 150 },
    { name: 'Gorra Rosa FAMAC', type: 'CAP', size: null, unitPrice: 10.00, totalQty: 500 },
    { name: 'Número de Participante', type: 'NUMBER', size: null, unitPrice: 5.00, totalQty: 1000 },
    { name: 'Pulsera Rosa Solidaria', type: 'OTHER', size: null, unitPrice: 3.00, totalQty: 800 },
    { name: 'Kit Hidratación (Agua + Snack)', type: 'OTHER', size: null, unitPrice: 8.00, totalQty: 600 },
  ];

  const items = [];
  for (const item of inventoryData) {
    const created = await prisma.inventoryItem.create({
      data: { ...item, walkEventId: walkEvent.id },
    });
    items.push(created);
  }
  console.log(`✅ ${items.length} productos de inventario creados`);

  // 4. Asignar stock a puntos de venta
  const stockAssignments = [
    // Sambil - punto principal
    { posIdx: 0, itemIdx: 0, qty: 60 }, { posIdx: 0, itemIdx: 1, qty: 100 },
    { posIdx: 0, itemIdx: 2, qty: 80 }, { posIdx: 0, itemIdx: 3, qty: 40 },
    { posIdx: 0, itemIdx: 4, qty: 150 }, { posIdx: 0, itemIdx: 5, qty: 250 },
    { posIdx: 0, itemIdx: 6, qty: 200 }, { posIdx: 0, itemIdx: 7, qty: 150 },
    // Plaza de la República
    { posIdx: 1, itemIdx: 0, qty: 40 }, { posIdx: 1, itemIdx: 1, qty: 80 },
    { posIdx: 1, itemIdx: 2, qty: 60 }, { posIdx: 1, itemIdx: 4, qty: 100 },
    { posIdx: 1, itemIdx: 5, qty: 200 }, { posIdx: 1, itemIdx: 6, qty: 150 },
    // Lago Mall
    { posIdx: 2, itemIdx: 0, qty: 50 }, { posIdx: 2, itemIdx: 1, qty: 90 },
    { posIdx: 2, itemIdx: 2, qty: 70 }, { posIdx: 2, itemIdx: 3, qty: 50 },
    { posIdx: 2, itemIdx: 4, qty: 120 }, { posIdx: 2, itemIdx: 5, qty: 200 },
    { posIdx: 2, itemIdx: 7, qty: 100 },
    // Sede FAMAC
    { posIdx: 3, itemIdx: 1, qty: 50 }, { posIdx: 3, itemIdx: 2, qty: 60 },
    { posIdx: 3, itemIdx: 4, qty: 80 }, { posIdx: 3, itemIdx: 5, qty: 200 },
    { posIdx: 3, itemIdx: 6, qty: 250 }, { posIdx: 3, itemIdx: 7, qty: 200 },
    // Plaza Baralt
    { posIdx: 4, itemIdx: 1, qty: 30 }, { posIdx: 4, itemIdx: 2, qty: 30 },
    { posIdx: 4, itemIdx: 4, qty: 50 }, { posIdx: 4, itemIdx: 5, qty: 150 },
    { posIdx: 4, itemIdx: 6, qty: 200 }, { posIdx: 4, itemIdx: 7, qty: 150 },
  ];

  for (const sa of stockAssignments) {
    await prisma.stock.create({
      data: {
        pointOfSaleId: pointsOfSale[sa.posIdx].id,
        inventoryItemId: items[sa.itemIdx].id,
        assignedQty: sa.qty,
        soldQty: 0,
      },
    });
  }
  console.log(`✅ ${stockAssignments.length} asignaciones de stock creadas`);

  // 5. Crear ventas con compradores reales
  const salesData = [
    { customer: 'Juan Pérez', ci: 'V-15234567', pos: 0, items: [{ idx: 1, qty: 2 }, { idx: 4, qty: 2 }, { idx: 5, qty: 2 }] },
    { customer: 'María Fernández', ci: 'V-18765432', pos: 0, items: [{ idx: 0, qty: 1 }, { idx: 4, qty: 1 }, { idx: 5, qty: 1 }] },
    { customer: 'Carlos Rodríguez', ci: 'V-20123456', pos: 1, items: [{ idx: 1, qty: 3 }, { idx: 5, qty: 3 }, { idx: 6, qty: 3 }] },
    { customer: 'Ana Suárez', ci: 'V-22345678', pos: 0, items: [{ idx: 2, qty: 1 }, { idx: 4, qty: 1 }, { idx: 7, qty: 1 }] },
    { customer: 'Pedro Ramírez', ci: 'V-19876543', pos: 2, items: [{ idx: 1, qty: 2 }, { idx: 4, qty: 3 }, { idx: 5, qty: 2 }] },
    { customer: 'Sofía Morales', ci: 'V-21098765', pos: 2, items: [{ idx: 2, qty: 2 }, { idx: 7, qty: 2 }] },
    { customer: 'Luis Hernández', ci: 'V-16543210', pos: 3, items: [{ idx: 1, qty: 1 }, { idx: 4, qty: 2 }, { idx: 6, qty: 5 }] },
    { customer: 'Laura Vargas', ci: 'V-23456789', pos: 1, items: [{ idx: 0, qty: 2 }, { idx: 5, qty: 2 }, { idx: 6, qty: 2 }] },
    { customer: 'Diego Torres', ci: 'V-17654321', pos: 4, items: [{ idx: 1, qty: 1 }, { idx: 4, qty: 1 }, { idx: 5, qty: 1 }] },
    { customer: 'Valentina Díaz', ci: 'V-24567890', pos: 0, items: [{ idx: 3, qty: 1 }, { idx: 4, qty: 1 }, { idx: 7, qty: 2 }] },
    { customer: 'Andrés Castillo', ci: 'V-14321098', pos: 2, items: [{ idx: 1, qty: 4 }, { idx: 5, qty: 4 }] },
    { customer: 'Gabriela Mendoza', ci: 'V-25678901', pos: 3, items: [{ idx: 2, qty: 3 }, { idx: 6, qty: 3 }, { idx: 7, qty: 3 }] },
    { customer: 'Roberto Silva', ci: 'V-13210987', pos: 4, items: [{ idx: 1, qty: 2 }, { idx: 4, qty: 2 }] },
    { customer: 'Patricia Flores', ci: 'V-26789012', pos: 0, items: [{ idx: 1, qty: 1 }, { idx: 2, qty: 1 }, { idx: 4, qty: 2 }, { idx: 5, qty: 1 }] },
    { customer: 'Fernando Ortiz', ci: 'V-12109876', pos: 1, items: [{ idx: 1, qty: 2 }, { idx: 6, qty: 4 }] },
    { customer: 'Claudia Rivas', ci: 'V-27890123', pos: 2, items: [{ idx: 0, qty: 1 }, { idx: 3, qty: 1 }, { idx: 7, qty: 1 }] },
    { customer: 'Miguel Acosta', ci: 'V-11098765', pos: 3, items: [{ idx: 4, qty: 3 }, { idx: 5, qty: 3 }, { idx: 6, qty: 5 }] },
    { customer: 'Daniela Chávez', ci: 'V-28901234', pos: 4, items: [{ idx: 2, qty: 1 }, { idx: 5, qty: 1 }] },
    { customer: 'Empresa ABC (compra corporativa)', ci: 'J-12345678-9', pos: 0, items: [{ idx: 1, qty: 20 }, { idx: 4, qty: 20 }, { idx: 5, qty: 20 }] },
    { customer: 'Colegio Santa Rosa', ci: 'J-98765432-1', pos: 3, items: [{ idx: 1, qty: 15 }, { idx: 5, qty: 15 }, { idx: 7, qty: 15 }] },
  ];

  let totalVentas = 0;
  for (const sale of salesData) {
    let total = 0;
    const saleItems = sale.items.map((si) => {
      const item = items[si.idx];
      const subtotal = Number(item.unitPrice) * si.qty;
      total += subtotal;
      return {
        inventoryItemId: item.id,
        quantity: si.qty,
        unitPrice: item.unitPrice,
        subtotal,
      };
    });

    await prisma.sale.create({
      data: {
        customerName: sale.customer,
        customerCi: sale.ci,
        total,
        pointOfSaleId: pointsOfSale[sale.pos].id,
        walkEventId: walkEvent.id,
        items: {
          create: saleItems,
        },
      },
    });

    // Actualizar stock vendido
    for (const si of sale.items) {
      await prisma.stock.update({
        where: {
          pointOfSaleId_inventoryItemId: {
            pointOfSaleId: pointsOfSale[sale.pos].id,
            inventoryItemId: items[si.idx].id,
          },
        },
        data: { soldQty: { increment: si.qty } },
      });
    }

    totalVentas += total;
  }
  console.log(`✅ ${salesData.length} ventas registradas (Total: Bs ${totalVentas.toFixed(2)})`);

  // 6. Crear patrocinantes
  const sponsorsData = [
    { companyName: 'Empresas Polar', tier: 'DIAMOND', amountBs: 15000.00, contactName: 'Carlos Mendoza', benefits: 'Logo principal en camisas, banner en meta, mención en todos los medios' },
    { companyName: 'Banco Occidental de Descuento', tier: 'PLATINUM', amountBs: 10000.00, contactName: 'Roberto Urdaneta', benefits: 'Logo secundario en camisas, stand en punto de partida' },
    { companyName: 'Farmacias SAAS', tier: 'GOLD', amountBs: 5000.00, contactName: 'Ana Martínez', benefits: 'Logo en gorras, hidratación para participantes' },
    { companyName: 'Clínica Paraíso', tier: 'GOLD', amountBs: 5000.00, contactName: 'Dr. Luis Parra', benefits: 'Stand médico durante el evento, logo en material POP' },
    { companyName: 'Supermercados Garzón', tier: 'SILVER', amountBs: 2500.00, contactName: 'José Garzón', benefits: 'Snacks para kit de hidratación, mención en redes' },
    { companyName: 'Panadería La Rosa', tier: 'SILVER', amountBs: 1500.00, contactName: 'Carmen Rosa', benefits: 'Refrigerios post-caminata, mención en programa' },
  ];

  for (const sponsor of sponsorsData) {
    await prisma.sponsor.create({
      data: { ...sponsor, walkEventId: walkEvent.id },
    });
  }
  console.log(`✅ ${sponsorsData.length} patrocinantes registrados (Total: Bs ${sponsorsData.reduce((a, s) => a + s.amountBs, 0).toFixed(2)})`);

  // 7. Crear gastos operativos
  const expensesData = [
    { concept: 'Impresión de camisas (1000 unidades)', amount: 8000.00, date: new Date('2026-09-15'), notes: 'Taller de serigrafía La Victoria' },
    { concept: 'Impresión de gorras (500 unidades)', amount: 2500.00, date: new Date('2026-09-15'), notes: 'Incluye bordado del logo' },
    { concept: 'Tarima y sonido para evento', amount: 3500.00, date: new Date('2026-10-01'), notes: 'Empresa de eventos SoundMax' },
    { concept: 'Transporte de mercancía a puntos', amount: 1200.00, date: new Date('2026-10-10'), notes: '3 viajes en camioneta' },
    { concept: 'Permisos municipales y logística', amount: 800.00, date: new Date('2026-10-05'), notes: 'Alcaldía de Maracaibo' },
    { concept: 'Hidratación adicional (500 botellas)', amount: 1000.00, date: new Date('2026-10-12'), notes: 'Agua mineral para participantes' },
    { concept: 'Material POP (banners, volantes)', amount: 1500.00, date: new Date('2026-09-20'), notes: 'Imprenta Digital Express' },
  ];

  for (const expense of expensesData) {
    await prisma.walkExpense.create({
      data: { ...expense, walkEventId: walkEvent.id },
    });
  }
  console.log(`✅ ${expensesData.length} gastos registrados (Total: Bs ${expensesData.reduce((a, e) => a + e.amount, 0).toFixed(2)})`);

  // 8. Crear asignaciones de fondos (trazabilidad)
  const allocationsData = [
    { concept: 'Mamografías preventivas', amount: 12000.00, quantity: 240, notes: 'Campaña de detección temprana en comunidades rurales del Zulia' },
    { concept: 'Quimioterapias subsidiadas', amount: 8000.00, quantity: 16, notes: 'Pacientes en tratamiento activo que no pueden costear la totalidad' },
    { concept: 'Prótesis mamarias post-mastectomía', amount: 5000.00, quantity: 10, notes: 'Programa de reconstrucción para pacientes de bajos recursos' },
    { concept: 'Transporte de pacientes a consultas', amount: 3000.00, quantity: 150, notes: 'Subsidio de traslado para pacientes foráneos' },
    { concept: 'Medicamentos oncológicos', amount: 6000.00, quantity: 30, notes: 'Compra centralizada de medicamentos a precio preferencial' },
  ];

  for (const alloc of allocationsData) {
    await prisma.fundAllocation.create({
      data: { ...alloc, walkEventId: walkEvent.id },
    });
  }
  console.log(`✅ ${allocationsData.length} asignaciones de fondos (Total: Bs ${allocationsData.reduce((a, al) => a + al.amount, 0).toFixed(2)})`);

  // Resumen
  const totalRecaudado = totalVentas + sponsorsData.reduce((a, s) => a + s.amountBs, 0);
  const totalGastos = expensesData.reduce((a, e) => a + e.amount, 0);
  const totalAsignado = allocationsData.reduce((a, al) => a + al.amount, 0);

  console.log('\n========================================');
  console.log('  📊 RESUMEN DE DATOS SEMBRADOS');
  console.log('========================================');
  console.log(`  Evento:        ${walkEvent.name}`);
  console.log(`  Meta:          Bs ${(50000).toLocaleString()}`);
  console.log(`  Ventas:        Bs ${totalVentas.toFixed(2)} (${salesData.length} transacciones)`);
  console.log(`  Patrocinios:   Bs ${sponsorsData.reduce((a, s) => a + s.amountBs, 0).toFixed(2)} (${sponsorsData.length} sponsors)`);
  console.log(`  Total Ingreso: Bs ${totalRecaudado.toFixed(2)}`);
  console.log(`  Gastos:        Bs ${totalGastos.toFixed(2)}`);
  console.log(`  Neto:          Bs ${(totalRecaudado - totalGastos).toFixed(2)}`);
  console.log(`  Asignado:      Bs ${totalAsignado.toFixed(2)} (${allocationsData.reduce((a, al) => a + al.quantity, 0)} tratamientos)`);
  console.log(`  Progreso:      ${((totalRecaudado / 50000) * 100).toFixed(1)}% de la meta`);
  console.log('========================================\n');
}

seedWalkData()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
