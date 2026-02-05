import { useLocalSearchParams } from 'expo-router';
import AttendanceViewerScreen from '../src/screens/AttendanceViewerScreen';

export default function AttendanceViewer() {
  const { userId, userName } = useLocalSearchParams();
  return <AttendanceViewerScreen route={{ params: { userId, userName } }} />;
}
