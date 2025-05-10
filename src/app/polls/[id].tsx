import { useLocalSearchParams} from "expo-router";
import { View, Text } from "react-native";

export default function PollDetails() {
  const { id } = useLocalSearchParams<{id:string}>();

 
  return (
    <View>
      <Text>Poll Details:{id}</Text>
    </View>
  );
}
