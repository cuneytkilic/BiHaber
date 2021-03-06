/* eslint-disable react-native/no-inline-styles */
import Menu, {MenuItem, Position} from 'react-native-enhanced-popup-menu';
import React, {Component} from 'react';
import {createSwitchNavigator, createAppContainer} from 'react-navigation';
import {createStackNavigator} from 'react-navigation-stack';
import Tum_Sekmeler from './src/pages/Tum_Sekmeler';
import {sha256} from 'react-native-sha256';
import AdminPage from './src/pages/Admin';
import AddLesson from './src/pages/AddLesson';
import UpdateLesson from './src/pages/UpdateLesson';
import Dersler from './src/pages/Dersler';
import Duyurular from './src/pages/AdminDuyurular';
import NotificationAddPage from './src/pages/NotificationAddPage';
import AkademisyenPage from './src/pages/AkademisyenPage';
import AkademisyenNotifPage from './src/pages/AkademisyenNotifPage';
import DersAkademisyen from './src/pages/DersAkademisyen';
import AddAkademisyen from './src/pages/AddAkademisyen';
import Akademisyen from './src/pages/Akademisyen';
import Hakkinda from './src/pages/Hakkinda';
import AktifDonem from './src/pages/AktifDonem';
import UpdateAkademisyen from './src/pages/UpdateAkademisyen';
import UpdateNotificationPage from './src/pages/UpdateNotificationPage';
import UpdateNotificationAkademisyenPage from './src/pages/UpdateNotificationAkademisyenPage';
import firebase from 'react-native-firebase';
import PushNotification from 'react-native-push-notification';
import AsyncStorage from '@react-native-community/async-storage';

import {
  Image,
  View,
  Alert,
  Text,
  KeyboardAvoidingView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  PushNotificationIOS,
} from 'react-native';
import RBSheet from 'react-native-raw-bottom-sheet';
import Icon from 'react-native-vector-icons/FontAwesome';

const AppStack = createStackNavigator(
  {
    Home: Tum_Sekmeler,
  },
  {
    headerMode: 'none',
  },
);

const AppContainer = createAppContainer(
  createSwitchNavigator(
    {
      App: AppStack,
    },
    {
      initialRouteName: 'App',
    },
  ),
);

class MainPage extends Component {
  constructor(props) {
    super(props);

    // Creating Global Variable.
    global.didUpdate = true; // güncelleme kapalı
    global.admin_duyuru_sayisi = 0;
    this.state = {
      my_res_arr: [],
      user_name: '',
      password: '',
      token_control_arr: [],
      isLoading: true,
      giris: null,
    };
  }
  componentDidMount() {
    console.disableYellowBox = true; // tüm uyarıları kapatır.
    this.get_token();
  }
  get_token = async () => {
    const fcmToken = await firebase.messaging().getToken();
    await fetch('http://bihaber.ankara.edu.tr/api/TokenKontrol', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        giden_token: fcmToken,
      }),
    })
      .then(response => response.json())
      .then(responseJson => {
        this.setState({token_control_arr: responseJson});
        if (this.state.token_control_arr.length === 0) {
          //ekleme işlemi yapılacak
          this.token_kaydet(fcmToken);
          console.log('token:: ' + fcmToken);
        } else {
          console.log('token zaten var');
        }
      })
      .catch(error => {
        console.error(error);
      });
  };
  token_kaydet = async token => {
    await fetch('http://bihaber.ankara.edu.tr/api/TokenKaydet', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        giden_token: token,
      }),
    })
      .then(response => response.text())
      .then(responseJson => {})
      .catch(error => {
        console.error(error);
      });
  };
  LoginKontrol = async (gelen_username, hashsiz_password, hashed_password) => {
    await fetch('http://bihaber.ankara.edu.tr/api/LoginProcess', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        Kullanici_Ad: gelen_username,
        Sifre: hashed_password,
      }),
    })
      .then(response => response.json())
      .then(responseJson => {
        this.setState({my_res_arr: responseJson});
        this._retrieveData();
        if (this.state.my_res_arr.length > 0) {
          //Eğer girilen bilgiler doğruysa buraya girecek
          this.setState({giris: 1});
          var yetki_control = '';
          var passedAkademisyen_id = 0;
          this.state.my_res_arr.map(x => (yetki_control = x.Yetki));
          this.state.my_res_arr.map(
            item => (passedAkademisyen_id = item.Yonetim_id),
          );

          if (yetki_control === '0') {
            this.Scrollable.close(); //bottomPage kapatmak için.
            this.storeData(gelen_username, hashsiz_password);
            this.props.navigation.navigate('AdminPage');
          } else {
            this.Scrollable.close();
            this.storeData(gelen_username, hashsiz_password);
            this.props.navigation.navigate('Akademisyen', {
              passedAkademisyen_id,
            });
          }
        } else {
          //Eğer girilen bilgiler doğru değilse buraya girecek
          Alert.alert('Uye bulunamadi.');
          this.Scrollable.close(); //bottomPage kapatmak için.
          //this.props.navigation.navigate('AdminPage');
        }
      })
      .catch(error => {
        console.error(error);
      });
  };
  storeData = async (kullanici_adi, sifre) => {
    try {
      await AsyncStorage.setItem('kullanici_adi', kullanici_adi);
      await AsyncStorage.setItem('sifre', sifre);
    } catch (e) {
      console.log(e);
    }
  };
  _retrieveData = async () => {
    try {
      const kullanici_adi = await AsyncStorage.getItem('kullanici_adi');
      const sifre = await AsyncStorage.getItem('sifre');
      if (kullanici_adi !== null && sifre !== null) {
        this.setState({user_name: kullanici_adi, password: sifre});
      }
    } catch (error) {
      console.log(error);
    }
  };
  FindTheAdmin = async (gelen_username, gelen_password) => {
    sha256(gelen_password).then(hashed_password => {
      this.LoginKontrol(gelen_username, gelen_password, hashed_password);
    });
  };
  goToMainActivity = () => {
    this.FindTheAdmin(this.state.user_name, this.state.password);
  };
  handleUserNameChange = Kullanici_Ad => {
    this.setState({user_name: Kullanici_Ad});
  };

  handlePasswordChange = password => {
    this.setState({password: password});
  };
  render() {
    let textRef = React.createRef();
    let menuRef = null;

    const setMenuRef = ref => (menuRef = ref);
    const hideMenu = () => menuRef.hide();
    const showMenu = () =>
      menuRef.show(textRef.current, (this.stickTo = Position.BOTTOM_CENTER));

    const onPress = () => showMenu();
    return (
      <View style={{flex: 1}}>
        <View style={styles.headerContainer}>
          <View style={styles.headerLeftContainer}>
            <Image
              style={{width: 45, height: 45}}
              source={require('./assets/images/logo.png')}
            />
            <Text style={{paddingLeft: 5, color: 'white', fontSize: 20}}>
              Bi'Haber
            </Text>
          </View>
          <View>
            <TouchableOpacity ref={textRef} style={styles.popup_menu}>
              {/* Sağ Üstteki Açılır Menü */}
              <TouchableOpacity
                style={styles.login_icon_container}
                onPress={onPress}>
                <Image
                  source={require('./assets/images/login.png')}
                  style={styles.HeaderImage}
                />
              </TouchableOpacity>
              {/* Açılır Menü İçindekiler */}
              <Menu ref={setMenuRef}>
                <MenuItem
                  onPress={() => {
                    this.Scrollable.open();
                    hideMenu();
                    this._retrieveData();
                  }}>
                  Login
                </MenuItem>
                <MenuItem
                  onPress={() => {
                    this.props.navigation.navigate('Hakkinda');
                    hideMenu();
                  }}>
                  Hakkında
                </MenuItem>
              </Menu>
            </TouchableOpacity>
            <RBSheet
              ref={ref => {
                this.Scrollable = ref;
              }}
              closeOnDragDown
              customStyles={{
                container: {
                  borderTopLeftRadius: 10,
                  borderTopRightRadius: 10,
                },
              }}
              height={500}>
              <KeyboardAvoidingView behavior="padding" style={styles.container}>
                <View style={styles.logoContainer}>
                  <Image
                    style={styles.logo}
                    source={require('./assets/images/logo.png')}
                  />
                </View>
                <View style={styles.formContainer}>
                  <View style={styles.loginForm}>
                    <View style={styles.usernameContainer}>
                      <Icon style={styles.iconStyle} name="user" size={20} />
                      <TextInput
                        onSubmitEditing={() => this.passwordInput.focus()}
                        placeholderTextColor="rgba(255,255,255,0.4)"
                        style={styles.inputStyle}
                        autoCapitalize="none"
                        autoCorrect={false}
                        placeholder="Username"
                        value={this.state.user_name}
                        onChangeText={this.handleUserNameChange}
                      />
                    </View>
                    <View style={styles.passwordContainer}>
                      <Icon style={styles.iconStyle} name="key" size={20} />
                      <TextInput
                        ref={input => (this.passwordInput = input)}
                        placeholderTextColor="rgba(255,255,255,0.4)"
                        style={styles.inputStyle}
                        autoCapitalize="none"
                        autoCorrect={false}
                        secureTextEntry
                        placeholder="Password"
                        value={this.state.password}
                        onChangeText={this.handlePasswordChange}
                      />
                    </View>
                    <TouchableOpacity
                      onPress={() => this.goToMainActivity()}
                      style={styles.buttonContainer}>
                      <Text style={styles.buttonText}>Oturum Aç</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </KeyboardAvoidingView>
            </RBSheet>
          </View>
        </View>
        <AppContainer />
      </View>
    );
  }
}
const AppNavigator = createStackNavigator(
  {
    Home: MainPage,
    AdminPage: AdminPage,
    AkademisyenPage: AkademisyenPage,
    AkademisyenNotifPage: AkademisyenNotifPage,
    DersAkademisyen: DersAkademisyen,
    AddLesson: AddLesson,
    UpdateLesson: UpdateLesson,
    Akademisyen: Akademisyen,
    Dersler: Dersler,
    Duyurular: Duyurular,
    NotificationAddPage: NotificationAddPage,
    AddAkademisyen: AddAkademisyen,
    Hakkinda: Hakkinda,
    AktifDonem: AktifDonem,
    UpdateNotificationPage: UpdateNotificationPage,
    UpdateNotificationAkademisyenPage: UpdateNotificationAkademisyenPage,
    UpdateAkademisyen: UpdateAkademisyen,
  },
  {
    initialRouteName: 'Home',
    headerMode: 'none',
  },
);
export default createAppContainer(AppNavigator);
const styles = StyleSheet.create({
  popup_menu: {
    flex: 1,
  },
  login_icon_container: {
    width: 60,
    right: 7,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  HeaderImage: {
    left: 5,
    width: 30,
    height: 30,
  },
  headerContainer: {
    padding: 5,
    height: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#3E53AE',
  },
  headerLeftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  container: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#20232a',
  },
  logoContainer: {
    marginTop: '30%',
  },
  logo: {
    width: 100,
    height: 100,
  },
  formContainer: {
    marginTop: 20,
    borderRadius: 10,
    backgroundColor: '#20232a',
    width: 300,
    height: 300,
  },
  loginForm: {
    alignItems: 'center',
    height: 200,
  },
  usernameContainer: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    borderRadius: 5,
    margin: 5,
    height: 40,
    width: 250,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconStyle: {
    width: 20,
  },
  inputStyle: {
    flex: 1,
  },
  passwordContainer: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    borderRadius: 5,
    margin: 5,
    height: 40,
    width: 250,
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonContainer: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginBottom: 5,
    marginTop: 20,
    borderRadius: 20,
    height: 40,
    width: 200,
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    padding: 5,
  },
});

PushNotification.configure({
  // (optional) Called when Token is generated (iOS and Android)
  onRegister: function(token) {
    console.log('TOKEN:', token);
  },
  largeIcon: 'ic_launcher',
  smallIcon: 'ic_launcher',
  // (required) Called when a remote or local notification is opened or received
  onNotification: function(notification) {
    console.log('NOTIFICATION:', notification);

    // process the notification

    // required on iOS only (see fetchCompletionHandler docs: https://github.com/react-native-community/react-native-push-notification-ios)
    notification.finish(PushNotificationIOS.FetchResult.NoData);
  },

  // ANDROID ONLY: GCM or FCM Sender ID (product_number) (optional - not required for local notifications, but is need to receive remote push notifications)
  senderID: '1067143997640',

  // IOS ONLY (optional): default: all - Permissions to register.
  permissions: {
    alert: true,
    badge: true,
    sound: true,
  },

  // Should the initial notification be popped automatically
  // default: true
  popInitialNotification: true,

  /**
   * (optional) default: true
   * - Specified if permissions (ios) and token (android and ios) will requested or not,
   * - if not, you must call PushNotificationsHandler.requestPermissions() later
   */
  // bildirim gönderme isteği default olarak true verdik. Kullanıcı belki bildirimleri kapatmak isteyebilir ?
  // bildirim göndermek için izin istememiz gerekebilir ?
  requestPermissions: true,
});
