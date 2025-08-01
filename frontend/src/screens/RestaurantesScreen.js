import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  RefreshControl,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  Searchbar,
  Chip,
  FAB,
  Portal,
  Modal,
  TextInput,
  Text,
} from 'react-native-paper';
import { restaurantesService } from '../services/api';

const RestaurantesScreen = () => {
  const [restaurantes, setRestaurantes] = useState([]);
  const [filteredRestaurantes, setFilteredRestaurantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLetra, setSelectedLetra] = useState('');
  const [selectedCiudad, setSelectedCiudad] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRestaurante, setEditingRestaurante] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    direccion: '',
    ciudad: '',
    url_foto: '',
  });

  // Letras del alfabeto para filtro
  const letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const ciudades = ['Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Bilbao', 'Málaga'];

  useEffect(() => {
    cargarRestaurantes();
  }, []);

  useEffect(() => {
    aplicarFiltros();
  }, [restaurantes, searchQuery, selectedLetra, selectedCiudad]);

  const cargarRestaurantes = async () => {
    try {
      setLoading(true);
      const response = await restaurantesService.getAll();
      if (response.success) {
        setRestaurantes(response.data);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los restaurantes');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await cargarRestaurantes();
    setRefreshing(false);
  };

  const aplicarFiltros = () => {
    let filtrados = [...restaurantes];

    // Filtro por búsqueda
    if (searchQuery) {
      filtrados = filtrados.filter(restaurante =>
        restaurante.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        restaurante.descripcion.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filtro por letra inicial
    if (selectedLetra) {
      filtrados = filtrados.filter(restaurante =>
        restaurante.nombre.toUpperCase().startsWith(selectedLetra)
      );
    }

    // Filtro por ciudad
    if (selectedCiudad) {
      filtrados = filtrados.filter(restaurante =>
        restaurante.ciudad.toLowerCase().includes(selectedCiudad.toLowerCase())
      );
    }

    setFilteredRestaurantes(filtrados);
  };

  const limpiarFiltros = () => {
    setSearchQuery('');
    setSelectedLetra('');
    setSelectedCiudad('');
  };

  const abrirModal = (restaurante = null) => {
    if (restaurante) {
      setEditingRestaurante(restaurante);
      setFormData({
        nombre: restaurante.nombre,
        descripcion: restaurante.descripcion,
        direccion: restaurante.direccion,
        ciudad: restaurante.ciudad,
        url_foto: restaurante.url_foto,
      });
    } else {
      setEditingRestaurante(null);
      setFormData({
        nombre: '',
        descripcion: '',
        direccion: '',
        ciudad: '',
        url_foto: '',
      });
    }
    setModalVisible(true);
  };

  const cerrarModal = () => {
    setModalVisible(false);
    setEditingRestaurante(null);
    setFormData({
      nombre: '',
      descripcion: '',
      direccion: '',
      ciudad: '',
      url_foto: '',
    });
  };

  const guardarRestaurante = async () => {
    try {
      if (editingRestaurante) {
        await restaurantesService.update(editingRestaurante.id, formData);
        Alert.alert('Éxito', 'Restaurante actualizado correctamente');
      } else {
        await restaurantesService.create(formData);
        Alert.alert('Éxito', 'Restaurante creado correctamente');
      }
      cerrarModal();
      cargarRestaurantes();
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar el restaurante');
    }
  };

  const eliminarRestaurante = async (id) => {
    Alert.alert(
      'Confirmar eliminación',
      '¿Estás seguro de que quieres eliminar este restaurante?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await restaurantesService.delete(id);
              Alert.alert('Éxito', 'Restaurante eliminado correctamente');
              cargarRestaurantes();
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar el restaurante');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Filtros */}
        <View style={styles.filtersContainer}>
          <Searchbar
            placeholder="Buscar restaurantes..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchbar}
          />
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsContainer}>
            {letras.map((letra) => (
              <Chip
                key={letra}
                selected={selectedLetra === letra}
                onPress={() => setSelectedLetra(selectedLetra === letra ? '' : letra)}
                style={styles.chip}
              >
                {letra}
              </Chip>
            ))}
          </ScrollView>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsContainer}>
            {ciudades.map((ciudad) => (
              <Chip
                key={ciudad}
                selected={selectedCiudad === ciudad}
                onPress={() => setSelectedCiudad(selectedCiudad === ciudad ? '' : ciudad)}
                style={styles.chip}
              >
                {ciudad}
              </Chip>
            ))}
          </ScrollView>

          {(selectedLetra || selectedCiudad || searchQuery) && (
            <Button onPress={limpiarFiltros} mode="outlined" style={styles.clearButton}>
              Limpiar filtros
            </Button>
          )}
        </View>

        {/* Lista de restaurantes */}
        {filteredRestaurantes.map((restaurante) => (
          <Card key={restaurante.id} style={styles.card}>
            <Card.Cover source={{ uri: restaurante.url_foto }} />
            <Card.Content>
              <Title>{restaurante.nombre}</Title>
              <Paragraph>{restaurante.descripcion}</Paragraph>
              <Paragraph style={styles.address}>
                📍 {restaurante.direccion}, {restaurante.ciudad}
              </Paragraph>
            </Card.Content>
            <Card.Actions>
              <Button onPress={() => abrirModal(restaurante)}>Editar</Button>
              <Button onPress={() => eliminarRestaurante(restaurante.id)} mode="outlined">
                Eliminar
              </Button>
            </Card.Actions>
          </Card>
        ))}

        {filteredRestaurantes.length === 0 && !loading && (
          <View style={styles.emptyContainer}>
            <Text>No se encontraron restaurantes</Text>
          </View>
        )}
      </ScrollView>

      {/* Modal para crear/editar restaurante */}
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={cerrarModal}
          contentContainerStyle={styles.modal}
        >
          <Title style={styles.modalTitle}>
            {editingRestaurante ? 'Editar Restaurante' : 'Nuevo Restaurante'}
          </Title>
          
          <TextInput
            label="Nombre"
            value={formData.nombre}
            onChangeText={(text) => setFormData({ ...formData, nombre: text })}
            style={styles.input}
          />
          
          <TextInput
            label="Descripción"
            value={formData.descripcion}
            onChangeText={(text) => setFormData({ ...formData, descripcion: text })}
            multiline
            numberOfLines={3}
            style={styles.input}
          />
          
          <TextInput
            label="Dirección"
            value={formData.direccion}
            onChangeText={(text) => setFormData({ ...formData, direccion: text })}
            style={styles.input}
          />
          
          <TextInput
            label="Ciudad"
            value={formData.ciudad}
            onChangeText={(text) => setFormData({ ...formData, ciudad: text })}
            style={styles.input}
          />
          
          <TextInput
            label="URL de la foto"
            value={formData.url_foto}
            onChangeText={(text) => setFormData({ ...formData, url_foto: text })}
            style={styles.input}
          />
          
          <View style={styles.modalActions}>
            <Button onPress={cerrarModal} style={styles.modalButton}>
              Cancelar
            </Button>
            <Button onPress={guardarRestaurante} mode="contained" style={styles.modalButton}>
              Guardar
            </Button>
          </View>
        </Modal>
      </Portal>

      {/* FAB para agregar restaurante */}
      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => abrirModal()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  filtersContainer: {
    padding: 16,
    backgroundColor: '#fff',
  },
  searchbar: {
    marginBottom: 16,
  },
  chipsContainer: {
    marginBottom: 16,
  },
  chip: {
    marginRight: 8,
  },
  clearButton: {
    alignSelf: 'flex-start',
  },
  card: {
    margin: 16,
    marginTop: 8,
  },
  address: {
    marginTop: 8,
    fontStyle: 'italic',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  modal: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
  modalTitle: {
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 8,
  },
});

export default RestaurantesScreen; 