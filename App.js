import React, { useState, createContext, useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  View,
  Text,
  Button,
  TextInput,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Modal,
  Alert
} from 'react-native';

// Контекст для авторизації та темної теми
const AuthContext = createContext();

const initialTrips = [
  { id: "1", title: "Париж", date: "01.02.2024", image: "https://via.placeholder.com/100", description: "Романтична подорож до столиці Франції" },
  { id: "2", title: "Рим", date: "15.03.2024", image: "https://via.placeholder.com/100", description: "Екскурсії античними пам'ятками" },
  { id: "3", title: "Лондон", date: "10.04.2024", image: "https://via.placeholder.com/100", description: "Прогулянки Темзою та відвідини музеїв" },
];

// Компонент для відображення подорожі
const TripItem = ({ item, onPress, onLongPress, isDarkTheme }) => (
  <TouchableOpacity
    onPress={onPress}
    onLongPress={onLongPress}
    style={[styles.tripItem, isDarkTheme && styles.darkTripItem]}
  >
    <Image source={{ uri: item.image }} style={styles.tripImage} />
    <View style={styles.tripInfo}>
      <Text style={[styles.tripTitle, isDarkTheme && styles.darkText]}>{item.title}</Text>
      <Text style={[styles.tripDate, isDarkTheme && styles.darkSecondaryText]}>{item.date}</Text>
    </View>
  </TouchableOpacity>
);

// Модальне вікно з деталями подорожі
const TripModal = ({ visible, trip, onClose, isDarkTheme }) => (
  <Modal
    animationType="slide"
    transparent={false}
    visible={visible}
    onRequestClose={onClose}
  >
    <SafeAreaView style={[styles.modalContainer, isDarkTheme && styles.darkContainer]}>
      {trip && (
        <>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, isDarkTheme && styles.darkText]}>{trip.title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={[styles.closeButton, isDarkTheme && styles.darkText]}>×</Text>
            </TouchableOpacity>
          </View>

          <Image source={{ uri: trip.image }} style={styles.modalImage} />

          <View style={styles.modalDetails}>
            <Text style={[styles.modalDetail, isDarkTheme && styles.darkText]}>
              <Text style={[styles.detailLabel, isDarkTheme && styles.darkText]}>Дата: </Text>
              {trip.date}
            </Text>
            <Text style={[styles.modalDetail, isDarkTheme && styles.darkText]}>
              <Text style={[styles.detailLabel, isDarkTheme && styles.darkText]}>Опис: </Text>
              {trip.description}
            </Text>
          </View>

          <Button 
            title="Закрити" 
            onPress={onClose} 
            color={isDarkTheme ? "#0066cc" : "#007AFF"}
          />
        </>
      )}
    </SafeAreaView>
  </Modal>
);

// Екран авторизації
const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useContext(AuthContext);

  const handleLogin = () => {
    if (login(username, password)) {
      navigation.replace('Main');
    } else {
      Alert.alert('Помилка', 'Невірні облікові дані');
    }
  };

  return (
    <SafeAreaView style={styles.loginContainer}>
      <Text style={styles.loginTitle}>Авторизація</Text>
      <TextInput
        style={styles.input}
        placeholder="Логін"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Пароль"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Button title="Увійти" onPress={handleLogin} />
    </SafeAreaView>
  );
};

// Екран подорожей
const TripsScreen = ({ navigation }) => {
  const { isDarkTheme } = useContext(AuthContext);
  const [trips, setTrips] = useState(initialTrips);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [filterDate, setFilterDate] = useState('');

  const handleDelete = (id) => {
    Alert.alert(
      "Видалити подорож",
      "Ви впевнені?",
      [
        { text: "Скасувати" },
        { text: "Видалити", onPress: () => setTrips(trips.filter(t => t.id !== id)) }
      ]
    );
  };

  const filteredTrips = trips.filter(trip => 
    filterDate ? trip.date.includes(filterDate) : true
  );

  return (
    <SafeAreaView style={[styles.container, isDarkTheme && styles.darkContainer]}>
      <TextInput
        style={[styles.input, isDarkTheme && styles.darkInput]}
        placeholder="Фільтр за датою (дд.мм)"
        value={filterDate}
        onChangeText={setFilterDate}
        placeholderTextColor={isDarkTheme ? "#aaa" : "#888"}
      />
      
      <FlatList
        data={filteredTrips}
        renderItem={({ item }) => (
          <TripItem 
            item={item}
            onPress={() => {
              setSelectedTrip(item);
              setModalVisible(true);
            }}
            onLongPress={() => handleDelete(item.id)}
            isDarkTheme={isDarkTheme}
          />
        )}
        keyExtractor={item => item.id}
      />
      
      <TouchableOpacity
        style={[styles.addButton, isDarkTheme && styles.darkAddButton]}
        onPress={() => navigation.navigate('AddTrip')}
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
      
      <TripModal 
        visible={modalVisible}
        trip={selectedTrip}
        onClose={() => setModalVisible(false)}
        isDarkTheme={isDarkTheme}
      />
    </SafeAreaView>
  );
};

// Екран додавання подорожі
const AddTripScreen = ({ navigation }) => {
  const { isDarkTheme } = useContext(AuthContext);
  const [newTrip, setNewTrip] = useState({
    title: "",
    date: "",
    image: "https://via.placeholder.com/100",
    description: ""
  });
  const { setTrips } = useContext(AuthContext);

  const handleAddTrip = () => {
    if (!newTrip.title || !newTrip.date) {
      Alert.alert("Помилка", "Будь ласка, заповніть назву та дату подорожі");
      return;
    }

    const dateRegex = /^\d{2}\.\d{2}\.\d{4}$/;
    if (!dateRegex.test(newTrip.date)) {
      Alert.alert("Помилка", "Невірний формат дати. Використовуйте дд.мм.рррр");
      return;
    }

    setTrips(prev => [...prev, {
      ...newTrip,
      id: Date.now().toString()
    }]);
    
    navigation.goBack();
  };

  return (
    <SafeAreaView style={[styles.container, isDarkTheme && styles.darkContainer]}>
      <Text style={[styles.screenTitle, isDarkTheme && styles.darkText]}>Додати подорож</Text>
      
      <TextInput
        style={[styles.input, isDarkTheme && styles.darkInput]}
        placeholder="Назва подорожі"
        value={newTrip.title}
        onChangeText={(text) => setNewTrip({...newTrip, title: text})}
        placeholderTextColor={isDarkTheme ? "#aaa" : "#888"}
      />
      
      <TextInput
        style={[styles.input, isDarkTheme && styles.darkInput]}
        placeholder="Дата (дд.мм.рррр)"
        value={newTrip.date}
        onChangeText={(text) => setNewTrip({...newTrip, date: text})}
        placeholderTextColor={isDarkTheme ? "#aaa" : "#888"}
      />
      
      <TextInput
        style={[styles.input, isDarkTheme && styles.darkInput, { height: 100 }]}
        placeholder="Опис подорожі"
        value={newTrip.description}
        onChangeText={(text) => setNewTrip({...newTrip, description: text})}
        placeholderTextColor={isDarkTheme ? "#aaa" : "#888"}
        multiline
      />
      
      <Button 
        title="Додати подорож" 
        onPress={handleAddTrip} 
        color={isDarkTheme ? "#0066cc" : "#007AFF"}
      />
    </SafeAreaView>
  );
};

// Екран налаштувань
const SettingsScreen = () => {
  const { user, logout, isDarkTheme, toggleTheme } = useContext(AuthContext);
  
  return (
    <SafeAreaView style={[styles.container, isDarkTheme && styles.darkContainer]}>
      <Text style={[styles.screenTitle, isDarkTheme && styles.darkText]}>Налаштування</Text>
      
      <View style={styles.settingItem}>
        <Text style={[styles.settingText, isDarkTheme && styles.darkText]}>Поточний користувач:</Text>
        <Text style={[styles.settingValue, isDarkTheme && styles.darkText]}>{user?.username}</Text>
      </View>
      
      <View style={styles.settingItem}>
        <Text style={[styles.settingText, isDarkTheme && styles.darkText]}>Тема:</Text>
        <Button
          title={isDarkTheme ? "Вимкнути темну тему" : "Увімкнути темну тему"}
          onPress={toggleTheme}
        />
      </View>
      
      <Button
        title="Вийти"
        onPress={logout}
        color="red"
      />
    </SafeAreaView>
  );
};

// Навігаційні компоненти
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabs = () => {
  const { isDarkTheme } = useContext(AuthContext);
  
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: isDarkTheme ? '#0066cc' : '#007AFF',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: { 
          backgroundColor: isDarkTheme ? '#333' : '#f0f0f0',
          borderTopColor: isDarkTheme ? '#555' : '#ddd'
        },
        headerStyle: {
          backgroundColor: isDarkTheme ? '#333' : '#007AFF',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Tab.Screen 
        name="Trips" 
        component={TripsScreen} 
        options={{ 
          title: 'Подорожі',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ color, fontSize: size }}>✈️</Text>
          ),
        }} 
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen} 
        options={{ 
          title: 'Налаштування',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ color, fontSize: size }}>⚙️</Text>
          ),
        }} 
      />
    </Tab.Navigator>
  );
};

// Провайдер авторизації
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [trips, setTrips] = useState(initialTrips);
  
  const authContext = {
    user,
    isDarkTheme,
    trips,
    setTrips,
    login: (username, password) => {
      const validUsers = [
        { username: 'admin', password: 'admin' },
        { username: 'user', password: '123' }
      ];
      const foundUser = validUsers.find(u => u.username === username && u.password === password);
      if (foundUser) setUser({ username });
      return !!foundUser;
    },
    logout: () => setUser(null),
    toggleTheme: () => setIsDarkTheme(prev => !prev)
  };

  return (
    <AuthContext.Provider value={authContext}>
      {children}
    </AuthContext.Provider>
  );
};

// Головний компонент додатка
export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen 
            name="Login" 
            component={LoginScreen} 
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Main" 
            component={MainTabs} 
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="AddTrip" 
            component={AddTripScreen}
            options={{ 
              title: 'Додати подорож',
              headerStyle: {
                backgroundColor: '#007AFF',
              },
              headerTintColor: '#fff',
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
}

// Стилі
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  darkContainer: {
    backgroundColor: '#1a1a1a',
  },
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  loginTitle: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  screenTitle: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: 'bold',
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 12,
    padding: 10,
    backgroundColor: '#fff',
  },
  darkInput: {
    borderColor: '#555',
    backgroundColor: '#333',
    color: '#fff',
  },
  tripItem: {
    flexDirection: 'row',
    padding: 15,
    marginBottom: 10,
    backgroundColor: '#fff',
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
  darkTripItem: {
    backgroundColor: '#333',
  },
  tripImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  tripInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  tripTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  tripDate: {
    fontSize: 14,
    color: '#666',
  },
  darkText: {
    color: '#fff',
  },
  darkSecondaryText: {
    color: '#aaa',
  },
  modalContainer: {
    flex: 1,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  closeButton: {
    fontSize: 30,
  },
  modalImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 20,
  },
  modalDetails: {
    marginBottom: 20,
  },
  modalDetail: {
    fontSize: 16,
    marginBottom: 10,
  },
  detailLabel: {
    fontWeight: 'bold',
  },
  settingItem: {
    marginBottom: 20,
  },
  settingText: {
    fontSize: 16,
    marginBottom: 5,
  },
  settingValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  addButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  darkAddButton: {
    backgroundColor: '#0066cc',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 30,
    lineHeight: 30,
  },
});