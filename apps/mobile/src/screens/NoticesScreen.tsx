import { Card, Muted, Screen, Title, Body } from '../components/ui';

const NOTICES = [
  {
    title: 'Demo recognition',
    body: 'Scanning matches the local catalogue until an AI provider is connected. Results are not model output.',
  },
  {
    title: 'Estimates only',
    body: 'Nutrition figures in this demo are illustrative. They are not laboratory measurements.',
  },
  {
    title: 'On this device',
    body: 'Your diary and profile are stored locally. There is no account server in this build.',
  },
];

export default function NoticesScreen() {
  return (
    <Screen>
      <Title>Notices</Title>
      <Body>Demo messages. These are not personal health alerts.</Body>
      {NOTICES.map((notice) => (
        <Card key={notice.title}>
          <Body>{notice.title}</Body>
          <Muted>{notice.body}</Muted>
        </Card>
      ))}
    </Screen>
  );
}
