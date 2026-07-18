import { Redirect } from 'expo-router';

export default function Index() {
  return <Redirect href="/(tabs)/(home)" />; // Change here to test to home page without login.
}
