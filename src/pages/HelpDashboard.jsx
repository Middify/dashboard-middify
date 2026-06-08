import React, { useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
// import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
// import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import SupportAgentOutlinedIcon from "@mui/icons-material/SupportAgentOutlined";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import CloseIcon from "@mui/icons-material/Close";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import PersonIcon from "@mui/icons-material/Person";
import PersonAddOutlinedIcon from "@mui/icons-material/PersonAddOutlined";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import PersonRemoveOutlinedIcon from "@mui/icons-material/PersonRemoveOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";

const HelpDashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeModal, setActiveModal] = useState(null);

  const categories = [
    /* 
    // MÓDULOS EN ESPERA DE SER DESARROLLADOS 
    {
      id: "orders",
      title: "Gestión de Órdenes",
      description: "Aprende a filtrar, exportar y cambiar estados de tus ventas.",
      icon: <ArticleOutlinedIcon fontSize="large" />,
      color: "text-indigo-600 bg-indigo-50",
    },
    {
      id: "products",
      title: "Inventario y Productos",
      description: "Administra tu catálogo, revisa el estado del stock y sincroniza precios.",
      icon: <Inventory2OutlinedIcon fontSize="large" />,
      color: "text-emerald-600 bg-emerald-50",
    }, 
    */
    {
      id: "users_create",
      title: "Creación de Usuarios",
      description:
        "Aprende a habilitar nuevos accesos para tu equipo de trabajo.",
      icon: <PersonAddOutlinedIcon fontSize="large" />,
      color: "text-amber-600 bg-amber-50",
    },
    {
      id: "users_permissions",
      title: "Permisos y Vistas",
      description:
        "Diferencias clave entre el rol de Administrador y Colaborador.",
      icon: <SecurityOutlinedIcon fontSize="large" />,
      color: "text-indigo-600 bg-indigo-50",
    },
    {
      id: "users_delete",
      title: "Remover Accesos",
      description:
        "Cómo desvincular a un colaborador de tu tienda en tiempo real.",
      icon: <PersonRemoveOutlinedIcon fontSize="large" />,
      color: "text-rose-600 bg-rose-50",
    },
  ];

  const faqs = [
    {
      question: "¿Cuántos usuarios colaboradores puedo crear?",
      answer:
        "Por límite de capacidad y seguridad, puedes tener un máximo de 5 usuarios activos por cada tienda que administres.",
    },
    {
      question: "¿Puede un colaborador (User) crear a otro usuario?",
      answer:
        "No. La creación, asignación de roles y eliminación de cuentas es un privilegio exclusivo de la cuenta Administradora (AdminTenant).",
    },
    {
      question:
        "¿Qué hago si mi colaborador no recibió el correo con su clave?",
      answer:
        "Pídele que revise su carpeta de Spam o Correo no deseado. El remitente automático es 'no-reply@verificationemail.com'. Si el problema persiste, comunícate con soporte para solicitar la eliminación permanente del usuario y así poder crearlo nuevamente desde cero.",
    },
  ];
  // Identificamos la categoría seleccionada para personalizar el Modal
  const activeCategory = categories.find((cat) => cat.id === activeModal);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-10 relative">
      {/*  HEADER Y BUSCADOR */}
      <section className="text-center space-y-6 bg-slate-900 rounded-3xl p-10 shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold text-white mb-3">
            ¿En qué podemos ayudarte hoy?
          </h1>
          <p className="text-slate-300 text-sm mb-8">
            Busca tutoriales, preguntas frecuentes o contacta a soporte.
          </p>

          <div className="max-w-2xl mx-auto relative">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400">
              <SearchIcon />
            </div>
            <input
              type="text"
              placeholder="Ej: ¿Cómo crear un nuevo usuario?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white pl-14 pr-4 py-4 rounded-xl border-none focus:ring-4 focus:ring-indigo-500/30 shadow-xl outline-none text-slate-800 placeholder:text-slate-400 font-medium transition-all"
            />
          </div>
        </div>
      </section>

      {/* CATEGORÍAS RÁPIDAS */}
      <section>
        <h2 className="text-xl font-bold text-slate-800 mb-6">
          Explora por temas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => setActiveModal(cat.id)}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer group flex flex-col"
            >
              <div
                className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${cat.color} group-hover:scale-110 transition-transform`}
              >
                {cat.icon}
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">
                {cat.title}
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed mb-4 flex-1">
                {cat.description}
              </p>
              <div className="flex items-center text-sm font-bold text-indigo-600 group-hover:text-indigo-700">
                Ver tutorial{" "}
                <ArrowForwardIosIcon
                  style={{ fontSize: "12px", marginLeft: "4px" }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PREGUNTAS FRECUENTES Y CONTACTO */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* FAQs */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-slate-800">
            Preguntas Frecuentes
          </h2>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100">
            {faqs.map((faq, index) => (
              <details
                key={index}
                className="group p-6 [&_summary::-webkit-details-marker]:hidden"
              >
                <summary className="flex items-center justify-between cursor-pointer list-none font-semibold text-slate-800">
                  {faq.question}
                  <span className="transition group-open:rotate-180 text-slate-400">
                    <svg
                      fill="none"
                      height="24"
                      shapeRendering="geometricPrecision"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      viewBox="0 0 24 24"
                      width="24"
                    >
                      <path d="M6 9l6 6 6-6"></path>
                    </svg>
                  </span>
                </summary>
                <p className="mt-4 text-slate-600 text-sm leading-relaxed">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>

        {/* Contacto sin botón (Solo texto/instrucción) */}
        <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-2xl p-8 text-white shadow-lg flex flex-col justify-center h-fit relative overflow-hidden">
          <div className="relative z-10">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-6 backdrop-blur-sm">
              <SupportAgentOutlinedIcon />
            </div>
            <h3 className="text-xl font-bold mb-3">¿Aún necesitas ayuda?</h3>
            <p className="text-indigo-100 text-sm leading-relaxed mb-4">
              Si presentas algún problema que no esté cubierto en nuestros
              tutoriales, nuestro equipo de soporte está listo para asistirte.
            </p>
            {/*<div className="bg-white/10 rounded-lg p-4 border border-white/20 backdrop-blur-md">
              <p className="text-sm font-medium text-white">
                Comunícate directamente a través de tu ejecutivo comercial
                asignado o envíanos un correo electrónico para recibir
                asistencia técnica personalizada.
              </p>
            </div>*/}
          </div>
        </div>
      </section>

      {/*  MODAL FLOTANTE DINÁMICO */}
      {activeCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header del Modal Dinámico */}
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${activeCategory.color}`}
                >
                  {activeCategory.icon}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">
                    {activeCategory.title}
                  </h2>
                  <p className="text-sm text-slate-500">Tutorial paso a paso</p>
                </div>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <CloseIcon />
              </button>
            </div>

            {/* Contenido scrolleable del Modal */}
            <div className="p-8 overflow-y-auto custom-scrollbar text-slate-600 space-y-8">
              {/* CREACIÓN DE USUARIOS */}
              {activeModal === "users_create" && (
                <section>
                  <p className="text-sm mb-4">
                    La creación de usuarios es exclusiva del administrador. Para
                    habilitar un nuevo acceso, sigue estos pasos:
                  </p>
                  <ol className="list-decimal pl-5 space-y-3 text-sm leading-relaxed mb-4">
                    <li>
                      Navega al apartado de <strong>Usuarios</strong> dentro del
                      menú lateral.
                    </li>
                    <li>
                      Haz clic en el botón <strong>"Crear Usuario"</strong>.
                    </li>
                    <li>
                      Ingresa el correo electrónico institucional y los datos
                      personales del nuevo integrante.
                    </li>
                    <li>
                      Selecciona el rol <strong>"UserTenant"</strong> y asígnale
                      la tienda correspondiente en la lista desplegable.
                    </li>
                  </ol>
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mt-4">
                    <h4 className="font-semibold text-blue-800 text-sm mb-1">
                      ¿Qué pasa después?
                    </h4>
                    <p className="text-sm text-blue-700">
                      El colaborador recibirá un correo electrónico automático
                      del sistema (remitente: no-reply@verificationemail.com)
                      con su nombre de usuario y una contraseña provisoria.
                    </p>
                  </div>
                </section>
              )}

              {/*  PERMISOS Y VISTAS */}
              {activeModal === "users_permissions" && (
                <section>
                  <p className="text-sm mb-4">
                    Las vistas del Dashboard cambian dependiendo del nivel de
                    acceso que tenga la cuenta:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Tarjeta Admin */}
                    <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-5 shadow-sm">
                      <h4 className="font-bold text-indigo-900 mb-3 flex items-center gap-2">
                        <SupervisorAccountIcon fontSize="small" /> Administrador
                        (AdminTenant)
                      </h4>
                      <ul className="space-y-2.5 text-sm text-indigo-800/90">
                        <li>
                          • <strong>Acceso global:</strong> Control total sobre
                          los paneles de sus tiendas asignadas.
                        </li>
                        <li>
                          • <strong>Usuarios:</strong> Exclusividad para{" "}
                          <strong>Crear Usuarios</strong> y listarlos.
                        </li>
                        <li>
                          • <strong>Tiendas:</strong> Acceso completo al módulo
                          de administración de Tiendas.
                        </li>
                        <li>
                          • <strong>Productos:</strong> Puede Importar catálogos
                          masivos, exportar, sincronizar y{" "}
                          <strong>
                            editar stock ingresando al detalle (ícono de ojo)
                          </strong>{" "}
                          en la tabla.
                        </li>
                        <li>
                          • <strong>Precios:</strong> Puede visualizar el
                          listado, sincronizar y{" "}
                          <strong>
                            actualizar precios ingresando al detalle (ícono de
                            ojo)
                          </strong>
                          .
                        </li>
                        <li>
                          • <strong>Órdenes:</strong> Gestión total (cambios de
                          estado y exportación).
                        </li>
                      </ul>
                    </div>

                    {/* Tarjeta User */}
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 shadow-sm">
                      <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                        <PersonIcon fontSize="small" /> Colaborador (UserTenant)
                      </h4>
                      <ul className="space-y-2.5 text-sm text-slate-600">
                        <li>
                          • <strong>Acceso operativo:</strong> Enfocado en la
                          operación del día a día.
                        </li>
                        <li>
                          • <strong>Usuarios:</strong> Solo puede listar a sus
                          compañeros (no puede crearlos).
                        </li>

                        <li>
                          • <strong>Productos:</strong> puede exportar,
                          sincronizar y{" "}
                          <strong>
                            editar stock desde el detalle (ícono de ojo)
                          </strong>
                          .
                        </li>
                        <li>
                          • <strong>Precios:</strong> Mismos privilegios (puede
                          sincronizar y{" "}
                          <strong>actualizar precios desde el detalle</strong>).
                        </li>
                        <li>
                          • <strong>Órdenes:</strong> Mismos privilegios
                          operativos (cambios de estado y exportación).
                        </li>
                      </ul>
                    </div>
                  </div>
                  {/*  CUADRO DE TRAZABILIDAD Y BITÁCORA */}
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 shadow-sm mt-8">
                    <h4 className="font-bold text-emerald-900 mb-2 flex items-center gap-2">
                      <HistoryOutlinedIcon
                        fontSize="small"
                        className="text-emerald-600"
                      />
                      Trazabilidad y Bitácora de Acciones
                    </h4>
                    <p className="text-sm text-emerald-800 leading-relaxed">
                      Es importante destacar que el sistema cuenta con un
                      registro de auditoría. Cada vez que un usuario realiza una
                      acción operativa (como cambiar el estado de una orden,
                      modificar el stock de un producto o actualizar precios),{" "}
                      <strong>
                        esta tarea queda permanentemente ligada a su cuenta
                      </strong>
                      . Esto garantiza total transparencia y permite identificar
                      qué miembro del equipo ejecutó cada movimiento en la
                      plataforma.
                    </p>
                  </div>
                </section>
              )}

              {/* VISTA 3: REMOCIÓN DE ACCESOS */}
              {activeModal === "users_delete" && (
                <section>
                  <p className="text-sm mb-4">
                    Si necesitas revocar el acceso de un colaborador a una
                    tienda en específico, el Administrador puede hacerlo en
                    tiempo real:
                  </p>
                  <ol className="list-decimal pl-5 space-y-3 text-sm leading-relaxed mb-4">
                    <li>
                      Navega al apartado de <strong>Tiendas</strong> en el menú
                      principal.
                    </li>
                    <li>
                      Selecciona la tienda donde está asignado el usuario.
                    </li>
                    <li>
                      Ve a la pestaña de <strong>Usuarios</strong> para ver la
                      lista de colaboradores asignados.
                    </li>
                    <li>
                      Haz clic en el ícono de{" "}
                      <strong>basurero (eliminar)</strong> junto al nombre del
                      usuario y confirma la acción.
                    </li>
                  </ol>

                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mt-5">
                    <h4 className="font-semibold text-amber-800 text-sm mb-2 flex items-center gap-2">
                      ¿Qué sucede realmente?
                    </h4>
                    <p className="text-sm text-amber-900 leading-relaxed">
                      Esta acción{" "}
                      <strong>no borra la cuenta del sistema</strong>, solo
                      destituye al usuario de la tienda. El colaborador aún
                      podrá iniciar sesión, pero perderá visibilidad total y se
                      encontrará con una pantalla de{" "}
                      <em>"Sin datos disponibles"</em>.
                    </p>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mt-4">
                    <h4 className="font-semibold text-slate-800 text-sm mb-1 flex items-center gap-2">
                      <SupportAgentOutlinedIcon
                        fontSize="small"
                        className="text-slate-500"
                      />
                      Eliminación Permanente
                    </h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      Si necesitas una eliminación total (por ejemplo, si
                      escribiste mal el correo y necesitas volver a crearlo),
                      debes contactar a soporte para que realicen el borrado
                      definitivo.
                    </p>
                  </div>
                </section>
              )}
            </div>

            {/* Footer del Modal */}
            <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 flex justify-end shrink-0">
              <button
                onClick={() => setActiveModal(null)}
                className="px-6 py-2 bg-slate-800 text-white text-sm font-medium rounded-xl hover:bg-slate-700 transition-colors"
              >
                Cerrar tutorial
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HelpDashboard;
