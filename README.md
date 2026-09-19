# BDP Crédito Móvil - Sistema de Evaluación de Riesgo Crediticio Agropecuario

Aplicación móvil oficial en **React Native / Expo** para oficiales de crédito del **Banco de Desarrollo Productivo (BDP S.A.M.)**.

Migración completa y  sincronizada de la plataforma web BDP (`bdp-credit-frontend`) con soporte para evaluación en campo, cálculo en vivo de cuotas francesas, balances patrimoniales, márgenes MUB, flujo de caja mensual proyectado     a 12 meses y dictamen de resolución crediticia.

---

## 🚀 Inicio Rápido

### 1. Iniciar la Aplicación Móvil
```bash
cd D:\hackaton.bdp\bdp-credit-movil
npx expo start
```

### 2. Opciones de Ejecución
Al iniciar Expo, presione:
* **`a`**: Abrir en emulador Android o dispositivo conectado con depuración USB activada.
* **`w`**: Abrir en navegador Web (`http://localhost:8081`).
* **Escanear código QR**: Usando la app **Expo Go** en un teléfono físico Android o iPhone.

---

## 📱 Funcionalidades y Pantallas

### 📋 1. Bandeja de Solicitudes (`ListadoScreen`)
* **KPIs en Vivo**: Total de solicitudes, cartera solicitada en Bs., promedio de monto y tasa ponderada.
* **Búsqueda Reactiva**: Por número de solicitud, nombre del solicitante o Cédula de Identidad (CI).
* **Filtros Avanzados**:
  * Selector modal con las **38 agencias oficiales del BDP** a nivel nacional.
  * Filtro por estado: `TODOS`, `EN_EVALUACION`, `APROBADO`, `RECHAZADO`.
* **5 Casos Benchmark precargados**:
  1. `202600147` - Rosario Guzmán Torrez (Montero - Soya)
  2. `202600148` - Adelfa Chavarría Flores (Padcaya - Papa y Maíz)
  3. `202600149` - Juan Carlos Mamani (Padcaya - Cítricos)
  4. `202600150` - Bernardino Quispe Apaza (Patacamaya - Quinua Real)
  5. `202600151` - Teodoro Mamani Choque (Ivirgarzama - Banano y Piña)
* **Acciones Rápidas**: Ver carátula, hoja de costos, dictamen o iniciar nueva solicitud.

---

### 📝 2. Carátula de Solicitud (`CaratulaScreen`)
* **Numeración Consecutiva Estricta**: Formato numérico oficial (ej. `202600152`, `202600153`).
* **Búsqueda por Cédula de Identidad (CI)**:
  * Si el CI existe en la base central (ej. `5021899`, `4582190`), autocompleta nombres y datos patrimoniales.
  * Si el CI no existe, habilita automáticamente el registro como **Cliente Nuevo**.
* **Condiciones Financieras**:
  * Monto solicitado (Bs.), plazo en meses, meses de gracia.
  * Tasa de interés anual preferencial (11.0% / 11.5%).
  * Frecuencia de pago: `SEMESTRAL`, `MENSUAL`, `BIMESTRAL`, `TRIMESTRAL`, `ANUAL`, `AL_VENCIMIENTO`.
  * Tipo de amortización: `FRANCES`, `CONSTANTE`.
* **Calculadora de Cuota Francesa en Vivo**: Proyección inmediata del valor de la cuota periódica.
* **Sincronización con Backend NestJS**: Botón para persistir en PostgreSQL o guardar localmente si el servidor está en campo sin cobertura.

---

### 👤 3. Datos Generales del Solicitante (`DatosGeneralesScreen`)
* **Datos Personales**: Nombres, apellidos, estado civil, grado de instrucción, dependientes.
* **Selectores Geográficos Jerárquicos Dependientes**:
  * **Departamento**: Los 9 departamentos de Bolivia (La Paz, Cochabamba, Santa Cruz, Tarija, etc.).
  * **Provincia**: Filtrada dinámicamente según el departamento seleccionado.
  * **Municipio**: Filtrado dinámicamente según la provincia seleccionada.
  * **Localidad / Comunidad**: Campo editable abierto.
* **Tenencia y Residencia**: Vivienda (Propia/Familiar/Alquilada) y predio productivo.
* **Clasificación Económica**: CAEDEC, sector y calificación Infocred / CIC (Categoría 1 a 5).

---

### 🌿 4. Hoja de Costos Agrícola (`HojaCostosScreen`)
* **Multicultivo**: Permite agregar y cambiar entre múltiples parcelas/cultivos.
* **Parámetros Agronómicos**:
  * Superficie cultivada (Has), rendimiento estimado por hectárea, merma / consumo familiar.
  * Precio de venta unitario por carga/quintal/caja/tonelada.
* **11 Rubros de Costos Agrícolas Interactivos**:
  * Preparación de suelo, siembra, semilla, fertilización orgánica/química, defensivos fitosanitarios, labores culturales, cosecha, flete y empaque.
* **Cálculo Automático**: Total de costos de producción, ventas brutas estimadas y Margen de Utilidad Bruta (**MUB %**).

---

### 📈 5. Flujo de Caja Mensual (`FlujoCajaScreen`)
* **Matriz de 12 Meses**: Distribución mensual de ingresos por venta de cosechas y egresos operativos y familiares.
* **Flujo Neto Mensual**: Superávit o déficit proyectado mes a mes.
* **Saldo Acumulado**: Control de liquidez para verificar meses críticos antes de la cosecha.
* **Resumen Anual**: Total ingresos, total egresos, saldo final de caja.

---

### ⚖️ 6. Dictamen y Resolución de Crédito (`ResolucionScreen`)
* **Ratios Financieros Clave**:
  * Cobertura de Amortización de Deuda (CA/SD $\ge 1.25$).
  * Margen de Utilidad Bruta (MUB %).
* **Condiciones Aprobadas**: Monto sugerido, plazo, frecuencia de pago y cuota pactada.
* **Veredicto Institucional**:
  * `APROBADO` (Verde)
  * `OBSERVADO` (Ámbar)
  * `RECHAZADO` (Rojo)
* **Firma y Oficial Responsable**: Comentarios del oficial de crédito asignado y sello de la agencia BDP.

---

## 🏛️ Conmutador de Oficiales de Crédito
El encabezado corporativo permite cambiar dinámicamente entre los 5 oficiales y supervisores BDP:
1. **Lic. Carlos Mendoza** - Agencia Patacamaya (La Paz / Altiplano Central)
2. **Ing. Mariana Ríos** - Agencia Padcaya (Tarija / Arce)
3. **Lic. Roberto Gómez** - Agencia Montero (Santa Cruz / Norte Integrado)
4. **Ing. Marcelo Fernández** - Agencia Ivirgarzama (Cochabamba / Trópico)
5. **Dr. Fernando Vargas** - Agencia Tarija Central (Supervisión Nacional)

---

## 🌐 Conexión Backend
* **Host Local**: `http://localhost:3000/api/v1` (o `http://10.0.2.2:3000/api/v1` en emulador Android).
* **Manejo Offline / En Campo**: Si el servidor no responde o el oficial está en área rural sin conectividad, la aplicación almacena y opera los registros localmente en memoria sin interrumpir el flujo de evaluación.
