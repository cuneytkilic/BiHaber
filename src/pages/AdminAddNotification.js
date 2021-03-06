/* eslint-disable react-native/no-inline-styles */
import React, {Component} from 'react';
import {Picker} from 'native-base';
import {
  StyleSheet,
  Image,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import {TextInput, ScrollView} from 'react-native-gesture-handler';

class AkademisyenNotifPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      token_bilgisi: '',
      ders_kodu: '',
      ders_id: '',
      baslik: '',
      icerik: '',
      my_lessons_arr: [],
      tokens_arr: [],
      bildirim_durum: '',
      height: Dimensions.get('window').height,
      width: Dimensions.get('window').width,
    };
  }

  FetchAllLessonsOfAkademisyen = async akademisyen_id => {
    await fetch('http://bihaber.ankara.edu.tr/api/BildirimDersleri', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        giden_akademisyen_id: akademisyen_id,
      }),
    })
      .then(response => response.json())
      .then(responseJson => {
        this.setState({my_lessons_arr: responseJson}); //html elemanlarının tekrardan render edilmesini sağlar
      })
      .catch(error => {
        console.error(error);
      });
  };

  componentDidMount = async () => {
    this.FetchAllLessonsOfAkademisyen(
      this.props.navigation.state.params.gonderilen_akademisyen_id,
    );
  };

  PostNotification = async () => {
    if (this.state.baslik !== '' && this.state.icerik !== '') {
      await fetch('http://bihaber.ankara.edu.tr/api/DersiAlanTokenlar', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gonderilen_ders_id: this.state.ders_id,
        }),
      })
        .then(response => response.json())
        .then(responseJson => {
          this.setState({tokens_arr: responseJson});
          if (this.state.tokens_arr.length !== 0) {
            this.state.tokens_arr.map(item => {
              this.SendNotification(item.Token_id);
            });
            this.SaveNotification();
          }
        })
        .catch(error => {
          console.error(error);
        });
      /*
    //dersi alan kullanıcıların tokenlarını cek,asagıdaki sendnotifiction fonksiyoununa for ile gönder
    this.SendNotification(
      ' dIy-Sl5SHSU:APA91bGAa47fDVQ0eKNYODyCfk2MBn5BEb64g9B6YhJXGatjVFdYD0oLjbt1-PCCzmOQkSAxME3lzbDsRNWdI7AsytLqRjThayeMv-lQ2a11MspeMfARb6Xc3VfcZWUh5vrLr94TOX1g',
    );*/

      this.props.navigation.navigate('Akademisyen');
    } else {
      Alert.alert('Bildirim başlığı veya bildirim içeriği boş geçilemez.');
    }
  };

  SendNotification = async gonderilecek_token => {
    await fetch('http://bihaber.ankara.edu.tr/api/Notification', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        giden_token: gonderilecek_token,
        giden_baslik: this.state.baslik,
        giden_icerik: this.state.icerik,
        giden_ders_kodu: this.state.ders_kodu,
      }),
    })
      .then(response => response.text())
      .then(responseJson => {})
      .catch(error => {
        console.error(error);
      });
  };

  SaveNotification = async () => {
    await fetch('http://bihaber.ankara.edu.tr/api/BildirimKaydet', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        giden_baslik: this.state.baslik,
        giden_icerik: this.state.icerik,
        giden_ders_id: this.state.ders_id,
        giden_ders_kodu: this.state.ders_kodu,
      }),
    })
      .then(response => response.text())
      .then(responseJson => {})
      .catch(error => {
        console.error(error);
      });
  };

  // formdan gelen verileri state'de depoluyoruz.
  handleNotificationTitleChange = title => {
    this.setState({baslik: title});
  };
  handleNotificationContentChange = content => {
    this.setState({icerik: content});
  };
  handleNotificationLessonCodeChange = (value, index) => {
    this.setState({ders_kodu: value, ders_id: value});
  };
  render() {
    return (
      <View style={styles.container}>
        <View style={styles.HeaderContainer}>
          <TouchableOpacity
            onPress={() => {
              this.props.navigation.navigate('Akademisyen');
            }}>
            <View style={styles.backIconContainer}>
              <Image
                style={styles.backIcon}
                source={require('../../assets/images/left_arrow.png')}
              />
            </View>
          </TouchableOpacity>
          <View
            style={{
              backgroundColor: '#3E53AE',
              justifyContent: 'center',
              width: '60%',
              alignItems: 'center',
            }}>
            <Text style={styles.HeaderText}>Bildirim Gönder</Text>
          </View>
          <View style={styles.backIconContainer} />
        </View>

        <ScrollView style={{width: '100%'}}>
          <View
            style={{
              backgroundColor: '#DDDDE6',
              width: '100%',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: this.state.height * 0.1,
            }}>
            <Image
              style={styles.imageStyle}
              source={require('../../assets/images/megaphone.png')}
            />
            <View style={styles.inputContainer}>
              <TextInput
                placeholder="Bildirim Başlık"
                onSubmitEditing={() => this.icerikInput.focus()}
                onChangeText={this.handleNotificationTitleChange}
                placeholderTextColor="#DDDDE6"
                value={this.state.baslik}
                style={styles.baslikStyle}
                autoCapitalize="none"
                autoCorrect={false}
                autoFocus={true}
              />
            </View>
            <View style={styles.inputContainer}>
              <TextInput
                onChangeText={this.handleNotificationContentChange}
                underlineColorAndroid="transparent"
                ref={input => (this.icerikInput = input)}
                value={this.state.icerik}
                placeholder="Bildirim İçerik"
                placeholderTextColor="#DDDDE6"
                style={styles.icerikStyle}
                autoCapitalize="none"
                autoCorrect={false}
                multiline
              />
            </View>

            {/*//Dönem seçmek için DropDownList*/}

            <View style={styles.PickerContainer}>
              <View style={styles.ders_kodu}>
                <Picker
                  mode="dropdown"
                  onValueChange={(valuex, index) =>
                    this.handleNotificationLessonCodeChange(valuex, index)
                  }
                  selectedValue={this.state.ders_kodu}>
                  {this.state.my_lessons_arr.map((item, key) => (
                    <Picker.Item
                      label={item.Ders_kodu}
                      value={item.Ders_id}
                      key={key}
                      color="black"
                    />
                  ))}
                </Picker>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => this.PostNotification()}
              style={styles.buttonContainer}>
              <Text style={styles.buttonText}>Gönder</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  PickerContainer: {
    backgroundColor: '#DDDDE6',
    width: '60%',
    height: 40,
    marginTop: 10,
    borderRadius: 5,
    flexDirection: 'row',
  },
  ders_kodu: {
    backgroundColor: '#acacac',
    width: '100%',
    borderRadius: 5,
    marginRight: '2%',
    justifyContent: 'center',
    paddingLeft: 5,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    padding: 5,
  },
  imageStyle: {
    width: 100,
    height: 100,
  },
  DropDownContainer: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    width: '60%',
    height: '8%',
    marginTop: 10,
    flexDirection: 'column',
    justifyContent: 'center',
    borderRadius: 5,
  },
  buttonContainer: {
    backgroundColor: '#20232a',
    marginBottom: 5,
    marginTop: 40,
    borderRadius: 20,
    height: 40,
    width: 200,
    justifyContent: 'center',
  },
  inputContainer: {
    backgroundColor: '#acacac',
    paddingHorizontal: 10,
    borderRadius: 5,
    marginTop: 10,
    width: '60%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  baslikStyle: {
    flex: 1,
  },
  icerikStyle: {
    flex: 1,
    height: 100,
  },
  container: {
    backgroundColor: '#DDDDE6',
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
  },
  HeaderContainer: {
    backgroundColor: '#3E53AE',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: 50,
    width: '100%',
  },
  HeaderImage: {
    width: 40,
    height: '100%',
    backgroundColor: 'black',
  },
  BodyContainer: {
    backgroundColor: '#DDDDE6',
    width: '100%',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIconContainer: {
    paddingLeft: 10,
    paddingRight: 10,
    width: '23%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    width: 30,
    height: 30,
  },
  HeaderText: {
    fontSize: 17,
    color: 'white',
  },
  TextContainer: {
    flexDirection: 'row',
    height: '4%',
    marginBottom: 5,
  },
  TextInputStyle: {
    borderBottomWidth: 1,
    padding: 0,
  },
  TextStyle: {
    width: '40%',
  },
});

export default AkademisyenNotifPage;
