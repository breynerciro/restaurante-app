import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  TextInput,
  Text,
  Chip,
  Divider,
  Portal,
  Modal,
  List,
} from 'react-native-paper';
import { restaurantesService, reservasService } from '../services/api';

const CrearReservaScreen = () => {
  const [restaurantes, setRestaurantes] = useState([]);
  const [selectedRestaurante, setSelectedRestaurante] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    nombre_cliente: '',
    email_cliente: '',
    telefono_cliente: '',
    fecha: new Date().toISOString().split('T')[0], // Formato YYYY-MM-DD
    hora: '12:00',
    numero_personas: '1',
  });

  useEffect(() => {
    cargarRestaurantes();
  }, []);

  const cargarRestaurantes = async () => {
    try {
      const response = await restaurantesService.getAll();
      if (response.success) {
        setRestaurantes(response.data);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los restaurantes');
    }
  };

  const seleccionarRestaurante = (restaurante) => {
    setSelectedRestaurante(restaurante);
    setModalVisible(false);
  };

  const formatearFecha = (fecha) => {
    return fecha.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const validarFormulario = () => {
    if (!selectedRestaurante) {
      Alert.alert('Error', 'Debes seleccionar un restaurante');
      return false;
    }
    
    if (!formData.nombre_cliente.trim()) {
      Alert.alert('Error', 'El nombre del cliente es requerido');
      return false;
    }
    
    if (!formData.email_cliente.trim()) {
      Alert.alert('Error', 'El email del cliente es requerido');
      return false;
    }
    
    if (!formData.telefono_cliente.trim()) {
      Alert.alert('Error', 'El teléfono del cliente es requerido');
      return false;
    }
    
    // Validar fecha
    const fechaRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!fechaRegex.test(formData.fecha)) {
      Alert.alert('Error', 'La fecha debe estar en formato YYYY-MM-DD');
      return false;
    }
    
    // Validar hora
    const horaRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!horaRegex.test(formData.hora)) {
      Alert.alert('Error', 'La hora debe estar en formato HH:MM');
      return false;
    }
    
    const numeroPersonas = parseInt(formData.numero_personas);
    if (numeroPersonas < 1 || numeroPersonas > 10) {
      Alert.alert('Error', 'El número de personas debe estar entre 1 y 10');
      return false;
    }
    
    return true;
  };

  const crearReserva = async () => {
    if (!validarFormulario()) return;
    
    try {
      setLoading(true);
      
      const reservaData = {
        restaurante_id: selectedRestaurante.id,
        nombre_cliente: formData.nombre_cliente.trim(),
        email_cliente: formData.email_cliente.trim(),
        telefono_cliente: formData.telefono_cliente.trim(),
        fecha: formData.fecha, // Use string date
        hora: formData.hora,
        numero_personas: parseInt(formData.numero_personas),
      };
      
      const response = await reservasService.create(reservaData);
      
      if (response.success) {
        Alert.alert(
          '¡Reserva creada!',
          `Tu reserva en ${selectedRestaurante.nombre} ha sido confirmada para el ${formatearFecha(new Date(formData.fecha))} a las ${formData.hora}`,
          [
            {
              text: 'OK',
              onPress: () => {
                // Limpiar formulario
                setSelectedRestaurante(null);
                setFormData({
                  nombre_cliente: '',
                  email_cliente: '',
                  telefono_cliente: '',
                  fecha: new Date().toISOString().split('T')[0], // Reset date
                  hora: '12:00',
                  numero_personas: '1',
                });
              },
            },
          ]
        );
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'No se pudo crear la reserva';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Selección de restaurante */}
        <Card style={styles.card}>
          <Card.Content>
            <Title>🏪 Seleccionar Restaurante</Title>
            {selectedRestaurante ? (
              <View style={styles.selectedRestaurant}>
                <Paragraph style={styles.restaurantName}>
                  {selectedRestaurante.nombre}
                </Paragraph>
                <Paragraph style={styles.restaurantAddress}>
                  📍 {selectedRestaurante.direccion}, {selectedRestaurante.ciudad}
                </Paragraph>
                <Button
                  onPress={() => setModalVisible(true)}
                  mode="outlined"
                  style={styles.changeButton}
                >
                  Cambiar Restaurante
                </Button>
              </View>
            ) : (
              <Button
                onPress={() => setModalVisible(true)}
                mode="contained"
                style={styles.selectButton}
              >
                Seleccionar Restaurante
              </Button>
            )}
          </Card.Content>
        </Card>

        {/* Información de la reserva */}
        <Card style={styles.card}>
          <Card.Content>
            <Title>📅 Información de la Reserva</Title>
            
            <View style={styles.dateTimeContainer}>
              <View style={styles.dateTimeRow}>
                <Text style={styles.label}>Fecha:</Text>
                <TextInput
                  value={formData.fecha}
                  onChangeText={(text) => setFormData({ ...formData, fecha: text })}
                  placeholder="YYYY-MM-DD"
                  style={styles.dateTimeInput}
                  maxLength={10}
                />
              </View>
              
              <View style={styles.dateTimeRow}>
                <Text style={styles.label}>Hora:</Text>
                <TextInput
                  value={formData.hora}
                  onChangeText={(text) => setFormData({ ...formData, hora: text })}
                  placeholder="HH:MM"
                  style={styles.dateTimeInput}
                  maxLength={5}
                />
              </View>
              
              <View style={styles.dateTimeRow}>
                <Text style={styles.label}>Personas:</Text>
                <TextInput
                  value={formData.numero_personas}
                  onChangeText={(text) => setFormData({ ...formData, numero_personas: text })}
                  keyboardType="numeric"
                  style={styles.numberInput}
                  maxLength={2}
                />
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Información del cliente */}
        <Card style={styles.card}>
          <Card.Content>
            <Title>👤 Información del Cliente</Title>
            
            <TextInput
              label="Nombre completo"
              value={formData.nombre_cliente}
              onChangeText={(text) => setFormData({ ...formData, nombre_cliente: text })}
              style={styles.input}
            />
            
            <TextInput
              label="Email"
              value={formData.email_cliente}
              onChangeText={(text) => setFormData({ ...formData, email_cliente: text })}
              keyboardType="email-address"
              style={styles.input}
            />
            
            <TextInput
              label="Teléfono"
              value={formData.telefono_cliente}
              onChangeText={(text) => setFormData({ ...formData, telefono_cliente: text })}
              keyboardType="phone-pad"
              style={styles.input}
            />
          </Card.Content>
        </Card>

        {/* Botón de confirmar */}
        <Button
          onPress={crearReserva}
          mode="contained"
          style={styles.confirmButton}
          loading={loading}
          disabled={!selectedRestaurante || loading}
        >
          Confirmar Reserva
        </Button>
      </ScrollView>

      {/* Modal de selección de restaurante */}
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modal}
        >
          <Title style={styles.modalTitle}>Seleccionar Restaurante</Title>
          <ScrollView style={styles.modalScroll}>
            {restaurantes.map((restaurante) => (
              <List.Item
                key={restaurante.id}
                title={restaurante.nombre}
                description={`${restaurante.direccion}, ${restaurante.ciudad}`}
                left={(props) => <List.Icon {...props} icon="food-fork-drink" />}
                onPress={() => seleccionarRestaurante(restaurante)}
                style={styles.restaurantItem}
              />
            ))}
          </ScrollView>
          <Button onPress={() => setModalVisible(false)}>Cancelar</Button>
        </Modal>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    margin: 16,
    marginTop: 8,
  },
  selectedRestaurant: {
    marginTop: 16,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  restaurantAddress: {
    color: '#666',
    marginBottom: 16,
  },
  changeButton: {
    alignSelf: 'flex-start',
  },
  selectButton: {
    marginTop: 16,
  },
  dateTimeContainer: {
    marginTop: 16,
  },
  dateTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  label: {
    flex: 1,
    fontWeight: 'bold',
    color: '#666',
  },
  dateTimeButton: {
    flex: 2,
  },
  numberInput: {
    flex: 2,
    height: 40,
  },
  input: {
    marginBottom: 16,
  },
  confirmButton: {
    margin: 16,
    marginTop: 8,
    paddingVertical: 8,
  },
  modal: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
    maxHeight: '80%',
  },
  modalTitle: {
    marginBottom: 20,
    textAlign: 'center',
  },
  modalScroll: {
    maxHeight: 400,
  },
  restaurantItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  dateTimeInput: {
    flex: 2,
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
  },
});

export default CrearReservaScreen; 