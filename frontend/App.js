import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider as PaperProvider } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Importar pantallas
import RestaurantesScreen from './src/screens/RestaurantesScreen';
import ReservasScreen from './src/screens/ReservasScreen';
import CrearReservaScreen from './src/screens/CrearReservaScreen';

const Tab = createBottomTabNavigator();

const App = () => {
  return (
    <PaperProvider>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;

              if (route.name === 'Restaurantes') {
                iconName = 'restaurant-menu';
              } else if (route.name === 'Reservas') {
                iconName = 'book';
              } else if (route.name === 'Nueva Reserva') {
                iconName = 'add-circle';
              }

              return <Icon name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: '#2196F3',
            tabBarInactiveTintColor: 'gray',
            headerStyle: {
              backgroundColor: '#2196F3',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          })}
        >
          <Tab.Screen 
            name="Restaurantes" 
            component={RestaurantesScreen}
            options={{ title: 'Restaurantes' }}
          />
          <Tab.Screen 
            name="Reservas" 
            component={ReservasScreen}
            options={{ title: 'Mis Reservas' }}
          />
          <Tab.Screen 
            name="Nueva Reserva" 
            component={CrearReservaScreen}
            options={{ title: 'Nueva Reserva' }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
};

export default App; 