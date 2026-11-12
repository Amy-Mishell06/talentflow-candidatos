TalentFlow · Registro de Postulantes (Ionic + Firebase)

Prototipo funcional (MVP) de una aplicación móvil para registrar hojas de vida de candidatos mediante un formulario digital y almacenarlas en Cloud Firestore.

1. Problema empresarial

TalentFlow S. A. (empresa ficticia) recibe hojas de vida por correo electrónico, en formatos distintos, lo que dificulta organizar, comparar y buscar perfiles. El equipo de Talento Humano necesita capturar la información de forma estructurada y guardarla en la nube para consultarla después.

Esta app reemplaza el correo por un formulario validado: cada postulante queda guardado como un documento en la colección candidatos, con cada dato en un campo independiente y consultable.

2. Integrantes
Integrante	Rol
Amy Mishell Díaz Rosero]	Desarrollo completo del MVP (trabajo individual)

Asignatura: Desarrollo de Aplicaciones Móviles · Repositorio: https://github.com/Amy-Mishell06/talentflow-candidatos.git

3. Objetivos y funcionalidades

Objetivo general: registrar y consultar postulantes desde una app móvil conectada a Firestore.

Funcionalidades implementadas:

 Vista Registrar: formulario de 13 campos en 5 secciones (datos personales, perfil profesional, disponibilidad, resumen y consentimiento).
 Validación de todos los campos antes de enviar; mensajes de error por campo y aviso general.
 Guardado de cada candidato como documento nuevo en candidatos con addDoc().
 Fecha de creación con serverTimestamp().
 Indicador de carga (ion-loading + spinner en el botón) y mensajes de éxito/error (ion-toast).
 El formulario se limpia después de guardar con éxito; botón “Limpiar” con confirmación (ion-alert).
 Vista Candidatos: lectura con getDocs(), ordenada por fecha de registro.
 Resumen por candidato (nombre, cargo, experiencia, habilidades, modalidad, fecha) y detalle completo en un modal.
 Estados de carga, error con botón “Reintentar” y lista vacía; deslizar para actualizar (ion-refresher).
 Bonus: búsqueda por nombre (ignora tildes), filtro por cargo y orden (más recientes, más antiguos, A–Z).
 Reglas de Firestore que validan estructura y tipos en el servidor.

Fuera del alcance (según el enunciado): autenticación, carga de PDF, edición y eliminación.

4. Tecnologías y componentes Ionic
Tecnología	Uso
Ionic 8 + Angular 20 (componentes standalone)	Interfaz móvil
Angular Reactive Forms	Modelo del formulario y validadores
Firebase JS SDK 12 (firebase/firestore)	addDoc, getDocs, query, orderBy, serverTimestamp
Cloud Firestore	Base de datos en la nube

Punto de partida: el proyecto registro-estudiantes-ejemplo. Se conservó su configuración (Angular 20, Ionic 8, Firebase 12) y su forma de conectarse a Firestore (getApps()/initializeApp() en un servicio). Se cambió lo siguiente:

Ejemplo base (estudiantes)	Este proyecto (candidatos)
3 campos (nombre, correo, edad)	13 campos + creadoEn, en 5 secciones
Una sola página con ngModel	2 pestañas (Registrar / Candidatos) con Reactive Forms
Validación manual con un if	Validadores de Angular y propios, con mensaje en cada campo
FirebaseService	CandidatosService con orden por fecha, límite de tiempo y mensajes de error
Lista simple	Lista con resumen, búsqueda, filtro, orden y detalle en modal
Regla allow read, create: if true	Regla que valida estructura, tipos y rangos al crear

Componentes Ionic utilizados (más de 20 tipos):

Obligatorios	Adicionales
ion-input (texto, email, tel, number)	ion-card (secciones del formulario)
ion-datetime (en ion-modal)	ion-segment (modalidad)
ion-radio-group + ion-radio (nivel académico)	ion-modal (fechas y detalle)
ion-select (cargo, filtros)	ion-toast, ion-loading, ion-alert
ion-checkbox (habilidades, consentimiento)	ion-spinner, ion-refresher
ion-textarea (resumen)	ion-searchbar, ion-badge, ion-chip, ion-avatar
ion-button	ion-tabs / ion-tab-bar (navegación)
ion-list / ion-item	ion-note, ion-icon, ion-header/ion-toolbar
5. Arquitectura
Página (UI)  ──►  CandidatosService  ──►  Firebase JS SDK  ──►  Cloud Firestore
registro.page      crear()  → addDoc()                          colección "candidatos"
candidatos.page    listar() → getDocs()

Las páginas no importan nada de Firestore: solo llaman al servicio. Así la lógica de datos queda en un solo lugar y las páginas se ocupan de la interfaz.

Estructura de carpetas
angular.json, package.json, tsconfig*.json, ionic.config.json
firestore.rules                     # Reglas de seguridad usadas
docs/capturas/                      # Evidencias
src/
├── index.html
├── main.ts                         # Arranque standalone (Ionic + router)
├── global.scss                     # Estilos globales
├── theme/variables.scss            # Color de marca
├── environments/
│   ├── environment.ts              # environment.firebase (completar)
│   └── environment.prod.ts
└── app/
    ├── app.component.ts            # <ion-app> + <ion-router-outlet>
    ├── app.routes.ts               # /tabs/registro y /tabs/candidatos
    ├── models/
    │   └── candidato.model.ts      # Interfaz Candidato
    ├── data/
    │   └── opciones.ts             # Cargos, niveles, habilidades, modalidades
    ├── validators/
    │   └── candidato.validators.ts # Validadores personalizados
    ├── services/
    │   └── candidatos.service.ts   # Lógica Firestore (addDoc / getDocs)
    └── pages/
        ├── tabs/                   # Barra de pestañas
        ├── registro/               # Formulario
        └── candidatos/             # Lista + detalle (modal)
Servicio Firebase (CandidatosService)
Constructor: inicializa la app de Firebase con environment.firebase (una sola vez) y obtiene Firestore.
crear(candidato): addDoc(collection(db, 'candidatos'), { ...candidato, creadoEn: serverTimestamp() }). Devuelve el ID generado.
listar(): getDocs(query(collection(db, 'candidatos'), orderBy('creadoEn', 'desc'))) y transforma cada documento en Candidato con su id.
Ambas operaciones tienen un límite de 15 s para que la interfaz no quede esperando sin conexión.
mensajeErrorFirebase() traduce códigos como permission-denied o unavailable a mensajes comprensibles.
Validaciones
Campo	Componente	Regla
nombres	ion-input	Obligatorio, mín. 3 caracteres (sin contar espacios), máx. 80
correo	ion-input email	Obligatorio, formato usuario@dominio.ext
telefono	ion-input tel	Obligatorio, 7–15 dígitos, + opcional
fechaNacimiento	ion-datetime	Obligatoria, no futura, mínimo 18 años
cargo	ion-select	Obligatorio (5 opciones)
nivelAcademico	ion-radio-group	Obligatorio (4 opciones)
experienciaAnios	ion-input number	Obligatorio, entero entre 0 y 50
modalidad	ion-segment	Presencial, Híbrida o Remota
habilidades	ion-checkbox	Al menos 1 de 7
fechaDisponibilidad	ion-datetime	Obligatoria, no anterior a hoy
aspiracionSalarial	ion-input number	Mayor a 0 (máx. 100 000)
resumen	ion-textarea	Obligatorio, mín. 30 caracteres, máx. 1000
consentimiento	ion-checkbox	Debe estar marcado

Las mismas reglas se repiten en firestore.rules, de modo que un dato inválido es rechazado aunque alguien salte la validación de la app.

6. Modelo de datos

Colección: candidatos (un documento por postulante, ID automático).

Campo	Tipo Firestore
nombres, correo, telefono, cargo, nivelAcademico, modalidad, resumen	string
fechaNacimiento, fechaDisponibilidad	string YYYY-MM-DD (ordenable y sin problemas de zona horaria)
experienciaAnios	number (entero)
aspiracionSalarial	number
habilidades	array de strings
consentimiento	boolean
creadoEn	timestamp (serverTimestamp())

Documento de ejemplo (datos ficticios):

json
{
  "nombres": "Valeria Andrade Ruiz",
  "correo": "valeria.andrade@ejemplo.com",
  "telefono": "0991234567",
  "fechaNacimiento": "1998-04-15",
  "cargo": "Desarrollador móvil",
  "nivelAcademico": "Tercer nivel",
  "experienciaAnios": 3,
  "modalidad": "Híbrida",
  "habilidades": ["Angular", "Ionic", "Firebase", "Git"],
  "fechaDisponibilidad": "2026-12-01",
  "aspiracionSalarial": 1400,
  "resumen": "Desarrolladora móvil con 3 años de experiencia creando aplicaciones híbridas con Ionic y Angular para el sector retail...",
  "consentimiento": true,
  "creadoEn": "Timestamp (servidor) · 12 de noviembre de 2026"
}
7. Instalación y ejecución

Requisitos: Node.js 20.19+ o 22.12+ (los que pide Angular 20) y npm. La CLI de Ionic es opcional.

bash
git clone https://github.com/Amy-Mishell06/talentflow-candidatos.git
cd talentflow-candidatos
npm install
npm run ionic:serve        # o: ionic serve   → http://localhost:8100
Configurar Firebase
En console.firebase.google.com crea un proyecto.
Compilación → Firestore Database → Crear base de datos (modo producción, región cercana, p. ej. southamerica-east1).
Configuración del proyecto → Tus apps → Web (</>) → registra la app y copia el objeto firebaseConfig.
Pega sus valores dentro de firebase: { ... } en src/environments/environment.ts (y en environment.prod.ts).
En Firestore → Reglas, pega el contenido de firestore.rules y publica.
Ejecuta npm run ionic:serve, registra un candidato y revisa el documento en la consola de Firestore.

Si la consola pide un índice al ordenar por creadoEn, no es necesario: los índices de un solo campo se crean automáticamente.

Ejecutar en Android (opcional)
bash
npm install @capacitor/core @capacitor/android && npm install -D @capacitor/cli
npx cap init "TalentFlow" com.talentflow.candidatos --web-dir=www
npm run build
npx cap add android
npx cap sync
npx cap open android
8. Evidencias

Todas las capturas usan datos ficticios.

Formulario de registro

Formulario organizado en tarjetas: datos personales, perfil profesional, disponibilidad, resumen y consentimiento.

<img width="350" alt="image" src="https://github.com/user-attachments/assets/3b6d045d-de12-436b-ba6c-608b7326a2a6" />

Validaciones

Al intentar guardar con datos inválidos, cada campo muestra su mensaje de error y no se envía nada a Firebase.

<img width="350" alt="image" src="https://github.com/user-attachments/assets/055fb2a3-4d6e-4b8c-ae23-b00696d90289" />

Listado de candidatos

Datos leídos desde Firestore: nombre, cargo, experiencia, habilidades y modalidad, con búsqueda y filtro.

<img width="350" alt="image" src="https://github.com/user-attachments/assets/75ed3451-00af-46ed-ae58-3b31fedef959" />

Detalle del candidato

Modal con la hoja de vida completa del registro seleccionado.

<img width="350" alt="image" src="https://github.com/user-attachments/assets/972abfd6-92a6-4674-956b-3b291186d963" />

9. Casos de prueba

Candidatos ficticios usados para poblar la base (mínimo 5):

#	Nombres	Cargo	Nivel	Exp.	Modalidad	Habilidades	Salario
1	Valeria Andrade Ruiz	Desarrollador móvil	Tercer nivel	3	Híbrida	Angular, Ionic, Firebase, Git	1400
2	Carlos Mendoza Paz	Analista de datos	Posgrado	6	Remota	Python, SQL, Git	2100
3	Daniela Torres León	Diseñador UX/UI	Tercer nivel	2	Presencial	JavaScript, Angular	1100
4	Andrés Villacís Mora	Soporte TI	Tecnología	0	Presencial	SQL, Git	650
5	Lucía Cevallos Rivas	Tester QA	Tercer nivel	4	Remota	JavaScript, Python, Git	1300
ID	Tipo	Caso	Datos de entrada	Resultado esperado	Resultado obtenido
CP-01	Éxito	Registro válido	Los 5 candidatos de la tabla anterior	Aviso verde “registrado correctamente”, formulario limpio y documento en Firestore con creadoEn	✔ Cumple: se crearon 5 documentos en candidatos
CP-02	Validación fallida	Correo inválido	correo = valeria@correo	No se guarda; mensaje “El formato del correo no es válido”	✔ Cumple: no se envió a Firebase
CP-03	Validación fallida	Sin consentimiento	Todo válido, consentimiento sin marcar	No se guarda; mensaje “Debes aceptar el consentimiento…”	✔ Cumple
CP-04	Validación fallida	Resumen corto y sin habilidades	resumen = Soy dev, ninguna habilidad	No se guarda; errores en resumen (mín. 30) y habilidades	✔ Cumple: se muestran ambos mensajes
CP-05	Validación fallida	Experiencia fuera de rango	experiencia = 55 y luego 2.5	Mensajes “máximo 50” y “número entero”	✔ Cumple
CP-06	Éxito	Listado y detalle	Abrir pestaña Candidatos y tocar un registro	Lista con los 5 candidatos; el modal muestra todos los campos	✔ Cumple
CP-07	Éxito	Persistencia	Recargar el navegador (F5)	Los candidatos siguen apareciendo (vienen de Firestore)	✔ Cumple
CP-08	Éxito (bonus)	Búsqueda y filtro	Buscar lucia; filtrar “Analista de datos”	Aparece Lucía Cevallos (sin importar la tilde); luego solo Carlos Mendoza	✔ Cumple

Resumen: 8 de 8 casos cumplen el resultado esperado (4 de éxito, 4 de validación fallida).

10. Seguridad y limitaciones

Reglas usadas (firestore.rules):

Solo la colección candidatos es accesible; todo lo demás está cerrado.
get/list: públicos.
create: público, pero solo si el documento tiene exactamente los 14 campos esperados con tipos y rangos válidos, consentimiento == true y creadoEn == request.time (el servidor pone la fecha).
update y delete: prohibidos.

Por qué no son seguras para producción:

Cualquier persona con la configuración web del proyecto puede leer todas las hojas de vida (datos personales: correo, teléfono, fecha de nacimiento, salario).
Cualquiera puede crear registros válidos de forma masiva (spam), y no hay límite de tasa.
La apiKey web no es secreta: la protección depende por completo de las reglas.

Cómo se restringiría en un sistema real:

Firebase Authentication para el personal de Talento Humano, con un rol en custom claims: allow read: if request.auth.token.rol == 'rrhh'.
Si los postulantes se registran solos: create solo con usuario autenticado y request.resource.data.uid == request.auth.uid; cada postulante solo lee su propio documento.
Firebase App Check para aceptar solicitudes solo desde la app oficial.
Restringir la apiKey por dominio/paquete en Google Cloud Console y cumplir la normativa de protección de datos personales (LOPDP en Ecuador).

Al terminar las pruebas cerrar la base:

match /{document=**} { allow read, write: if false; }

Credenciales: no se publican cuentas de servicio, claves privadas ni contraseñas. Todos los datos son ficticios.

Limitaciones del MVP: sin autenticación, sin edición/eliminación, sin carga de PDF, sin paginación (lee toda la colección; suficiente para decenas o cientos de registros) y la búsqueda/filtro se hace en el dispositivo.

11. Distribución del trabajo

Trabajo individual: Amy Díaz realizó todas las tareas.

Etapa	Tareas
Preparación	Estudio del ejemplo base, creación del proyecto Firebase y de Firestore, configuración de environment.ts
Formulario	Modelo Candidato, formulario por secciones, validadores personalizados y estilos
Persistencia	CandidatosService con addDoc(), getDocs() y serverTimestamp(); reglas de Firestore
Consulta	Listado, detalle en modal, búsqueda, filtro y ordenamiento
Cierre	Pruebas con datos ficticios, capturas, README y publicación en GitHub
12. Conclusiones
Firestore permite guardar cada hoja de vida como un documento con campos consultables, lo que resuelve el desorden de recibirlas por correo.
Validar dos veces (en el formulario y en las reglas de Firestore) evita registros incompletos aunque alguien salte la validación de la app.
Para pasar a producción hacen falta autenticación y reglas por rol, porque los datos personales de los postulantes no deben ser públicos.
