import { Text, Pressable, StyleSheet} from "react-native"

interface Props  {
    label: string;

    position?: 'left' | 'right';

    //Methods
    onPress?: () => void;
    OnLongPress?:() => void;
}


export default function FAB({ label, onPress, OnLongPress,

    position = 'right',
}: Props) {
    return(
        <Pressable 
        style = {[styles.floatingButton, 
            position == 'right' ? styles.positionRight : styles.positionLeft,
            ]}
        onPress={onPress}
        onLongPress={OnLongPress}
        >
        <Text style={{color: 'white', fontSize: 20}}>{label}</Text>
      </Pressable> 
    );

}

const styles = StyleSheet.create({
    floatingButton: {
    position: 'absolute',
    bottom: 20,
    
    backgroundColor: '#65558f',
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: {width: 0, height:4},
    shadowOpacity: 0.3,
    elevation: 3,
  },
  positionRight: {
    right:20,
  },
  positionLeft: {
    // position: 'absolute',
    left:20,
  },
})