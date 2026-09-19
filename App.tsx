import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Pressable, StyleSheet, Text,
  TouchableOpacity,
  View } from 'react-native';
import FAB from './components/FAB';

export default function App() {

  const [count, SetCount] = useState(10)


  return (
    <View style={styles.container}>
      <Text style = {styles.textHuge}>{count}</Text>


        <FAB label = "+1" 
          onPress={ () => SetCount(count + 1)}
          OnLongPress={ () => SetCount(0)}
          position='left'
        />

      <StatusBar style="dark" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  textHuge: {
    fontSize: 120,
    fontWeight: '100'
  },

  
});
