import { useState } from 'react';

// Datos para Cloud (Azure / App Services)
const activities_cloud = [
    {
        no: 1,
        activity: "Presentar el diagrama de arquitectura (Solo una tarea para todos los ambientes.)",
        responsible: "Equipo DEV",
        requestedBy: "",
        estimatedTime: "30 min."
    },
    {
        no: 2,
        activity: "Crear los repositorios para la parte aplicativa en GitHub (Solo una tarea para todos los ambientes.)",
        responsible: "SCM Habilitador",
        requestedBy: "",
        estimatedTime: "1 hr."
    },
    {
        no: 3,
        activity: "Crear el repositorio de MANIFIESTOS (Solo una tarea para todos los ambientes.)",
        responsible: "SCM Habilitador",
        requestedBy: "",
        estimatedTime: "1 hr."
    },
    {
        no: 4,
        activity: "Creación GitHub App para la conexión con ArgoCD (Solo una tarea para todos los ambientes.)",
        responsible: "SCM Automatizador",
        requestedBy: "",
        estimatedTime: "1 hr."
    },
    {
        no: 5,
        activity: "Creación de Github Token para actualizar el repositorio de manifiestos con la última versión de la imagen (Solo una tarea para todos los ambientes.)",
        responsible: "SCM Automatizador",
        requestedBy: "",
        estimatedTime: "1 hr."
    },
    {
        no: 6,
        activity: "Creación credenciales programáticas del ACR para registro de contenedores (server, usuario, contraseña y repositorio) (Una tarea para ambientes no productivos y otra tarea para ambientes productivos.)",
        responsible: "Equipo cloud",
        requestedBy: "",
        estimatedTime: ""
    },
    {
        no: 7,
        activity: "Creación de ticket para bóveda en Conjur (Una tarea por ambiente.)",
        responsible: "Coordinador de Seguridad",
        requestedBy: "",
        estimatedTime: ""
    },
    {
        no: 8,
        activity: "Creación de ticket para secretos en Conjur (Una tarea por ambiente.)",
        responsible: "Coordinador de Seguridad",
        requestedBy: "",
        estimatedTime: ""
    },
    {
        no: 9,
        activity: "Configuración de pipelines para recuperar los secretos de Conjur. - Solicitar archivo de configuración que almacena los secretos (Una tarea por ambiente.)",
        responsible: "SCM Automatizador",
        requestedBy: "",
        estimatedTime: ""
    },
    {
        no: 10,
        activity: "Solicitar permisos para acceder a los ambientes en donde se necesita desplegar",
        responsible: "SCM Coordinador",
        requestedBy: "Equipo cloud",
        estimatedTime: ""
    },
    {
        no: 11,
        activity: "Realizar los actions para CI-CD del aplicativo",
        responsible: "",
        requestedBy: "",
        estimatedTime: ""
    }
];

// Datos para On-Premise (IIS / WebLogic)
const activities_onpremise = [
    {
        no: 1,
        activity: "Solicitar la prioridad del repositorio para analisis de desacoplamiento y automatizacion",
        responsible: "SCM Habilitador",
        requestedBy: "Líder Técnico (LT)",
        estimatedTime: "4 hrs."
    },
    {
        no: 2,
        activity: "Validacion de line base del codigo fuente en el repositorio, solicitar ultimo CHO y se pide la confirmacion de que es una aplicacion productiva asi como la ultima version instalada ejemplo v3.4.5 o en proceso de llegar a produccion.",
        responsible: "SCM Habilitador",
        requestedBy: "Líder Técnico (LT)",
        estimatedTime: "8 hrs."
    },
    {
        no: 3,
        activity: "Si es un repositorio a desacoplarse se envia propuesta y se solicita confirmacion, al desacloplarse el repositorio pasa a la organizacion de github BackUp-BO",
        responsible: "SCM Habilitador",
        requestedBy: "Líder Técnico (LT)",
        estimatedTime: "4 hrs."
    },
    {
        no: 4,
        activity: "Crear una tarea de automatizacion en le tablero de azure SCM-ServiceHub-StaffIng",
        responsible: "SCM Automatizador",
        requestedBy: "Líder Técnico (LT)",
        estimatedTime: "30 min."
    },
    {
        no: 5,
        activity: "Presentar el diagrama de arquitectura del flujo actual de despliegue hacia servidores on-premise (Solo una tarea para todos los ambientes.)",
        responsible: "Líder Técnico (LT)",
        requestedBy: "SCM Automatizador",
        estimatedTime: "30 min."
    },
    {
        no: 6,
        activity: "Proporcionar detalles técnicos de compilación y contruccion con el CLI de la tecnologia usada por ejemplo msbuild o maven incluyendo comandos, dependencias, que tipo de artefacto generara (EAR, WAR, DLL, ejecutables) y configuraciones necesarias",
        responsible: "Líder Técnico (LT)",
        requestedBy: "SCM Automatizador",
        estimatedTime: "1 hr."
    },
    {
        no: 7,
        activity: "Proporcionar en la tarea de azure como manejan los secretos y que variables cambian por ambiente (variable de github)",
        responsible: "SCM Automatizador",
        requestedBy: "Líder Técnico (LT)",
        estimatedTime: "30 min."
    },
    {
        no: 8,
        activity: "Las siguientes 3 activades dependen que la iniciativa tenga el rol coordinador de seguridad asignado, de lo contrario se usara github secrets",
        responsible: "SCM Automatizador",
        requestedBy: "Líder Técnico (LT)",
        estimatedTime: "30 min."
    },
    {
        no: 9,
        activity: "Creación de ticket para bóveda en Conjur (Una tarea por ambiente.)",
        responsible: "Accenture",
        requestedBy: "Coordinador de Seguridad",
        estimatedTime: "SLA Accenture"
    },
    {
        no: 10,
        activity: "Crear GitHub Actions para compilación y construccion (Una tarea por ambiente.)",
        responsible: "SCM Automatizador",
        requestedBy: "",
        estimatedTime: "10 hrs."
    },
    {
        no: 11,
        activity: "Creación de ticket para secretos en Conjur (Una tarea por ambiente.)",
        responsible: "Accenture",
        requestedBy: "Coordinador de Seguridad",
        estimatedTime: "SLA Accenture"
    },
    {
        no: 12,
        activity: "Configuración de pipelines para recuperar los secretos de Conjur. - Solicitar archivo de configuración que almacena los secretos (Una tarea por ambiente.)",
        responsible: "SCM Automatizador",
        requestedBy: "Coordinador de Seguridad",
        estimatedTime: "8 hrs."
    },
    {
        no: 13,
        activity: "Definir estrategia de versionamiento de artefactos (EAR, WAR, DLL, ejecutables) y nomenclatura de paquetes",
        responsible: "Líder Técnico (LT)",
        requestedBy: "SCM Automatizador",
        estimatedTime: "30 min."
    },
    {
        no: 14,
        activity: "Validacion del artefacto generado en la ruta sharepoint compatida en la tarea de azure. nota: el artefacto que se comparta en sharepoint no debe ser modificado ya debe traer tanto los secretos como las variables necesarias para su funcionamiento",
        responsible: "Líder Técnico (LT)",
        requestedBy: "SCM Automatizador",
        estimatedTime: "1 hr."
    },
    {
        no: 15,
        activity: "Sesion de entrega del action y explicacion de los release y pre-release de github que se generan asi como el versionamiento semantico manejado por github y en los artefactos de sharepoint",
        responsible: "SCM Automatizador",
        requestedBy: "Líder Técnico (LT)",
        estimatedTime: "1 hr."
    }
];

export default function AutomationGuidelines() {
    const [deploymentType, setDeploymentType] = useState('cloud');

    const currentActivities = deploymentType === 'cloud' ? activities_cloud : activities_onpremise;

    const downloadExcel = () => {
        const table = document.getElementById('activitiesTable');
        if (!table) return;

        const exportTable = table.cloneNode(true);

        // Remove badges and get text content only
        const cells = exportTable.querySelectorAll('td span');
        cells.forEach(cell => {
            const text = cell.textContent || '';
            const parent = cell.parentElement;
            if (parent) {
                parent.textContent = text;
            }
        });

        const html = `
            <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
                <head>
                    <meta charset="utf-8">
                    <style>
                        table { border-collapse: collapse; width: 100%; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                        th { background-color: #f2f2f2; font-weight: bold; }
                    </style>
                </head>
                <body>
                    ${exportTable.outerHTML}
                </body>
            </html>
        `;

        const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `automation-guidelines-${deploymentType}-${new Date().toISOString().split('T')[0]}.xls`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const downloadCSV = () => {
        const headers = ['No', 'Actividades', 'Responsable', 'A quien se solicita', 'Tiempo estimado'];
        const rows = currentActivities.map(activity => [
            activity.no,
            activity.activity,
            activity.responsible,
            activity.requestedBy,
            activity.estimatedTime
        ]);

        const csv = [headers, ...rows]
            .map(row => row.map(cell => {
                const text = String(cell || '');
                return text.includes(',') || text.includes('"')
                    ? `"${text.replace(/"/g, '""')}"`
                    : text;
            }).join(','))
            .join('\n');

        const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `automation-guidelines-${deploymentType}-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    return (
        <section className="w-full max-w-7xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-black mb-2">
                        Automation Guidelines
                    </h2>
                </div>

                {/* Download Buttons */}
                <div className="flex gap-2">
                    <button
                        onClick={downloadExcel}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 font-medium shadow-md hover:shadow-lg"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                        </svg>
                        Descargar Excel
                    </button>
                    <button
                        onClick={downloadCSV}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 font-medium shadow-md hover:shadow-lg"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                        </svg>
                        Descargar CSV
                    </button>
                </div>
            </div>

            {/* Deployment Type Tabs */}
            <div className="mb-6">
                <div className="border-b border-gray-200 dark:border-gray-700">
                    <nav className="flex gap-4" aria-label="Tabs">
                        <button
                            onClick={() => setDeploymentType('cloud')}
                            className={`px-6 py-3 text-sm font-semibold border-b-2 transition-colors duration-200 ${deploymentType === 'cloud'
                                ? 'border-[#fec630] text-[#fec630]'
                                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-[#fec630]'
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"></path>
                                </svg>
                                Cloud (Azure / App Services)
                            </div>
                        </button>
                        <button
                            onClick={() => setDeploymentType('onpremise')}
                            className={`px-6 py-3 text-sm font-semibold border-b-2 transition-colors duration-200 ${deploymentType === 'onpremise'
                                ? 'border-[#fec630] text-[#fec630]'
                                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-[#fec630]'
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"></path>
                                </svg>
                                On-Premise (IIS / WebLogic)
                            </div>
                        </button>
                    </nav>
                </div>
            </div>

            {/* Table Container */}
            <div className="overflow-x-auto rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                <table id="activitiesTable" className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider w-16">
                                No
                            </th>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                Actividades
                            </th>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider w-48">
                                Responsable
                            </th>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider w-48">
                                A quien se solicita
                            </th>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider w-32">
                                Tiempo estimado
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-[#303030] divide-y divide-gray-200 dark:divide-gray-700">
                        {currentActivities.map((activity) => (
                            <tr key={activity.no} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="flex items-center justify-center w-8 h-8 bg-[#fec630] text-gray-900 rounded-full font-bold text-sm">
                                        {activity.no}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                                    {activity.activity}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {activity.responsible && (
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                                            {activity.responsible}
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {activity.requestedBy && (
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
                                            {activity.requestedBy}
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {activity.estimatedTime && (
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                                            {activity.estimatedTime}
                                        </span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Table Info */}
            <div className="mt-4 text-sm text-gray-600">
                Total de actividades: <span className="font-semibold text-gray-900">{currentActivities.length}</span>
            </div>
        </section>
    );
}
