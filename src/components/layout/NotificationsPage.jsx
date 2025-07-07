import React, { useState, useEffect } from 'react';
import { FiBell, FiCheck, FiX, FiClock } from 'react-icons/fi';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = () => {
      try {
        // Mock data - remplacer par un appel API réel
        const mockNotifications = [
          { 
            id: 1, 
            title: 'Nouveau message', 
            content: 'Vous avez reçu un nouveau message de l\'administrateur.', 
            date: new Date('2023-10-15T10:30:00Z'), 
            read: false 
          },
          { 
            id: 2, 
            title: 'Mise à jour système', 
            content: 'Une mise à jour est prévue ce soir à minuit.', 
            date: new Date('2023-10-14T09:15:00Z'), 
            read: true 
          },
          { 
            id: 3, 
            title: 'Paiement reçu', 
            content: 'Votre paiement a été traité avec succès.', 
            date: new Date('2023-10-13T14:45:00Z'), 
            read: false 
          },
        ];
        
        setNotifications(mockNotifications);
      } catch (error) {
        console.error('Erreur lors du chargement des notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const markAsRead = (id) => {
    setNotifications(notifications.map(notification => 
      notification.id === id ? { ...notification, read: true } : notification
    ));
  };

  const deleteNotification = (id) => {
    setNotifications(notifications.filter(notification => notification.id !== id));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notification => ({ ...notification, read: true })));
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Chargement des notifications...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Notifications</h1>
        <button 
          onClick={markAllAsRead}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <FiCheck className="mr-2" />
          Tout marquer comme lu
        </button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        {notifications.length === 0 ? (
          <div className="text-center py-10">
            <FiBell className="mx-auto text-gray-400 text-4xl" />
            <p className="mt-4 text-gray-500">Aucune notification</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {notifications.map((notification) => (
              <li 
                key={notification.id} 
                className={`p-4 hover:bg-gray-50 transition-colors ${
                  notification.read ? 'bg-gray-50' : 'bg-white'
                }`}
              >
                <div className="flex justify-between">
                  <div className="flex-1">
                    <div className="flex items-start">
                      <div className={`flex-shrink-0 h-3 w-3 rounded-full mt-1.5 ${
                        notification.read ? 'bg-gray-400' : 'bg-blue-600'
                      }`}></div>
                      <div className="ml-3">
                        <h3 className="font-medium text-gray-900">{notification.title}</h3>
                        <p className="text-gray-600 mt-1">{notification.content}</p>
                        <div className="flex items-center text-xs text-gray-500 mt-2">
                          <FiClock className="mr-1" />
                          <span>{formatDate(notification.date)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {!notification.read && (
                      <button 
                        onClick={() => markAsRead(notification.id)}
                        className="p-1.5 rounded-full hover:bg-green-100 text-green-600"
                        title="Marquer comme lu"
                      >
                        <FiCheck />
                      </button>
                    )}
                    <button 
                      onClick={() => deleteNotification(notification.id)}
                      className="p-1.5 rounded-full hover:bg-red-100 text-red-600"
                      title="Supprimer"
                      >
                      <FiX />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;