import { Redirect } from 'expo-router';

export default function Index() {
  return <Redirect href="/login" />; // Change here to test to home page without login.
}
