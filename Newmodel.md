
🏗️ Arquitectura del Módulo de Caminata
Para resolver la transición de lo manual a lo digital, el sistema debe dividirse en cuatro pilares fundamentales:

1. Gestión de Inventario y "Puntos Rosas"
Actualmente, el control de cuántas camisas o números hay en cada punto (C.C. Sambil, Lago Mall, etc.) suele ser por llamadas o Excel.

Distribución de Stock: Permitir asignar lotes de productos (tallas de camisas, gorras, números) a puntos de venta específicos.

Venta en Tiempo Real: Una interfaz móvil (PWA) para que el voluntario en el punto rosa registre la venta. Al usar React 19, pueden aprovechar los Server Actions para que la actualización del stock sea instantánea, Se tiene que hacer que las ventas sean automaticas en el sitio que seria el punto rosa o en los diferentes puntos de venta, este registro se puede hacer por ahora que el encargado de llevar las cuentas use la aplicacion para el registro de las ventas. .

Registro de Comprador: Capturar datos básicos (nombre, cédula, correo) Los numeros de la caminara se entregan en FISICO.

2. Dashboard Estadístico y Factibilidad (El "Cerebro")
Esto es lo que más le interesa a la directiva para tomar decisiones.

Proyección de Recaudación: Un gráfico que compare el dinero recaudado vs. la meta necesaria para cubrir los tratamientos de las pacientes.

Mapa de Calor de Ventas: Ver qué "Punto Rosa" está vendiendo más para reforzar el stock o la publicidad en esa zona.

Análisis de Gastos vs. Ingresos: Un módulo para cargar costos operativos (logística, tarima, hidratación) y ver el margen real de ayuda neta.

3. Gestión de Patrocinantes
Niveles de Sponsor: Clasificación (Diamante, Platino, Oro) con los beneficios que cada uno recibe.

Exposición de Marca: Un apartado donde se gestione el logo de la empresa para que aparezca automáticamente en la web de resultados o correos masivos.

4. Integración con el Sistema de Pacientes
Trazabilidad del Dinero: Aquí está la magia. Poder decir: "El dinero recaudado en la caminata de este año permitió costear 500 mamografías y 200 quimioterapias". Conectar el ingreso de la caminata con el egreso en el módulo de pacientes que ya tienen.

🛠️ Especificación Técnica (Prisma & NestJS)
Para que el sistema sea sólido, el modelo de datos es clave. Aquí te doy una idea de cómo estructurar las tablas en PostgreSQL usando Prisma:

Fragmento de código
model WalkEvent {
  id          String   @id @default(uuid())
  year        Int      @unique
  goalAmount  Decimal
  status      String   // Planeación, Activo, Finalizado
  items       InventoryItem[]
  sponsorships Sponsor[]
}

model PointOfSale {
  id          String   @id @default(uuid())
  name        String   // Ej: Sambil Maracaibo
  location    String
  sales       Sale[]
  stock       Stock[]
}

model Sale {
  id            String   @id @default(uuid())
  customerName  String
  customerEmail String
  total         Decimal
  createdAt     DateTime @default(now())
  pointOfSaleId String
  pointOfSale   PointOfSale @relation(fields: [pointOfSaleId], references: [id])
}
🎨 Experiencia de Usuario (UI/UX) con Tailwind v4
Para que el sistema sea "atractivo" y fácil de usar por voluntarios que quizás no son expertos en tecnología:

Modo Rosa (Theming): Usar las nuevas capacidades de Tailwind CSS v4 para definir una paleta de colores basada en el rosa institucional de FAMAC con variables dinámicas.

Framer Motion: Animaciones suaves en los gráficos del dashboard para que la directiva vea cómo "crecen" las barras de recaudación al abrir el sistema.

PWA (Progressive Web App): Fundamental. Los voluntarios en la calle a veces tienen mala conexión. El sistema debe permitir registrar ventas offline y sincronizar cuando haya señal.

💡 ¿Cómo "venderles" que Wittysoft es la mejor opción?
Para cerrar el trato con FAMAC, no les hablen solo de código; háblenles de impacto y transparencia:

Transparencia Total: "Con nuestro sistema, cada persona que compre un número sabrá exactamente para que se usa ese dinero que se gana con la caminata".

Cero Costo de Licencia: "Al ser un desarrollo propio con tecnologías modernas y open-source, no dependen de pagos mensuales a terceros".

Memoria Histórica: "A diferencia del papel, nuestro sistema guardará las estadísticas año tras año para que en 2027 puedan comparar con 2026 y saber cómo mejorar".


