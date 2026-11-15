/**
 * /signup — kept so existing links work. Sign up now lives on the combined
 * Login / Sign up screen (app/(auth)/login.tsx).
 */

import React from 'react';
import { Redirect } from 'expo-router';

export default function SignupRedirect(): React.JSX.Element {
  return <Redirect href="/(auth)/login?mode=signup" />;
}
