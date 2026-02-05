import { useLocalSearchParams } from 'expo-router';
import EditDetailsScreen from '../src/screens/EditDetailsScreen';

export default function EditDetails() {
  const { user } = useLocalSearchParams();
  const parsedUser = user ? JSON.parse(user) : null;
  return <EditDetailsScreen route={{ params: { user: parsedUser } }} />;
}
