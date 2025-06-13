
const notifications = [
  {
    id: 1,
    date: '10/09/2024',
    message: '¡Gas bajo mínimos! Recarga lo antes posible para que el sistema siga en marcha'
  },
  {
    id: 2,
    date: '09/09/2024',
    message: 'Nuevo comercio: Panadería José pan rico'
  },
  {
    id: 3,
    date: '08/09/2024',
    message: 'Solicitud de baja: El comercio Frutas y verduras muy ricas'
  },
  {
    id: 4,
    date: '09/09/2024',
    message: 'Solicitud de cobro: El comercio Superchachi solicita el cobro de 25,4 Eurfy'
  },
  {
    id: 5,
    date: '08/09/2024',
    message: 'Solicitud de recarga: El ciudadano Antonio Gonzalez solicita una recarga de 50 Eurfy con el concepto "La comida de la semana".'
  }
];

const Notifications = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      <main className="flex-1 p-8 overflow-auto">
        <h1 className="text-3xl font-bold mb-8">Notificaciones</h1>
        
        <div className="bg-white rounded-lg shadow">
          {notifications.map((notification) => (
            <div 
              key={notification.id} 
              className="border-b border-gray-200 p-4 hover:bg-gray-50"
            >
              <div className="text-sm text-gray-500 mb-1">
                {notification.date}
              </div>
              <div className="text-gray-800">
                {notification.message}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Notifications;
