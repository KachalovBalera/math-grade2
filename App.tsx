import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { TopicId } from './src/types/math';

// Экраны
import { HomeScreen } from './src/screens/HomeScreen';
import { TopicsScreen } from './src/screens/TopicsScreen';
import { TenTransitionScreen } from './src/screens/TenTransitionScreen';
import { BracketsScreen } from './src/screens/BracketsScreen';
import { QuizScreen } from './src/screens/QuizScreen';
import { DailyTrainingScreen } from './src/screens/DailyTrainingScreen';
import { ErrorReviewScreen } from './src/screens/ErrorReviewScreen';
import { AchievementsScreen } from './src/screens/AchievementsScreen';
import { ParentDashboardScreen } from './src/screens/ParentDashboardScreen';
import { CurriculumSettingsScreen } from './src/screens/CurriculumSettingsScreen';

type ScreenName =
  | 'home'
  | 'topics'
  | 'tenTransition'
  | 'brackets'
  | 'quiz'
  | 'daily'
  | 'errors'
  | 'achievements'
  | 'parentDashboard'
  | 'curriculumSettings';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenName>('home');
  const [screenParams, setScreenParams] = useState<any>({});

  const navigate = (screen: ScreenName, params?: any) => {
    setScreenParams(params || {});
    setCurrentScreen(screen);
  };

  const goHome = () => {
    setCurrentScreen('home');
    setScreenParams({});
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {currentScreen === 'home' && (
        <HomeScreen onNavigate={(screen, params) => navigate(screen as ScreenName, params)} />
      )}

      {currentScreen === 'topics' && (
        <TopicsScreen
          onBack={goHome}
          onSelectTopic={(topicId: TopicId) => {
            if (topicId === 'tenTransition') {
              navigate('tenTransition');
            } else if (topicId === 'brackets') {
              navigate('brackets');
            } else {
              navigate('quiz', { topicId });
            }
          }}
        />
      )}

      {currentScreen === 'tenTransition' && (
        <TenTransitionScreen onBack={goHome} />
      )}

      {currentScreen === 'brackets' && (
        <BracketsScreen onBack={goHome} />
      )}

      {currentScreen === 'quiz' && (
        <QuizScreen
          topicId={screenParams.topicId || 'numbers'}
          onBack={() => navigate('topics')}
        />
      )}

      {currentScreen === 'daily' && (
        <DailyTrainingScreen
          onBack={goHome}
          onOpenCurriculum={() => navigate('curriculumSettings')}
        />
      )}

      {currentScreen === 'errors' && (
        <ErrorReviewScreen onBack={goHome} />
      )}

      {currentScreen === 'achievements' && (
        <AchievementsScreen onBack={goHome} />
      )}

      {currentScreen === 'parentDashboard' && (
        <ParentDashboardScreen
          onBack={goHome}
          onOpenCurriculum={() => navigate('curriculumSettings')}
        />
      )}

      {currentScreen === 'curriculumSettings' && (
        <CurriculumSettingsScreen onBack={goHome} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
});
