import { useLayoutEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useNavigation } from '@react-navigation/native';
import { useSensorDashboard } from '../hooks/useSensorDashboard';

const DashboardScreen = () => {
  const { summaries, loading, error, refresh } = useSensorDashboard();
  const [viewMode, setViewMode] = useState<'cards' | 'charts'>('cards');
  const navigation = useNavigation<any>();
  const { width: windowWidth } = useWindowDimensions();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity style={styles.headerButton} onPress={() => navigation.navigate('Settings')}>
          <Text style={styles.headerButtonText}>Configurações</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const cardLayout = useMemo(() => {
    const columns = windowWidth >= 900 ? 3 : windowWidth >= 600 ? 2 : 1;
    const horizontalPadding = 32; // ScrollView content padding
    const spacing = 16;
    const availableWidth = Math.max(windowWidth - horizontalPadding, 280);
    const totalSpacing = spacing * (columns - 1);
    const cardWidth = Math.max(220, (availableWidth - totalSpacing) / columns);
    return { columns, cardWidth, spacing };
  }, [windowWidth]);

  const chartLayout = useMemo(() => {
    const columns = windowWidth >= 1024 ? 3 : windowWidth >= 700 ? 2 : 1;
    const horizontalPadding = 32;
    const spacing = 16;
    const availableWidth = Math.max(windowWidth - horizontalPadding, 280);
    const totalSpacing = spacing * (columns - 1);
    const width = Math.max(240, (availableWidth - totalSpacing) / columns);
    return { columns, width, spacing };
  }, [windowWidth]);

  const chartData = useMemo(() => {
    if (!summaries.length) {
      return [];
    }

    return summaries.map((summary) => {
      const recent = summary.readings.slice(-10);
      return {
        sensorId: summary.sensorId,
        labels: recent.map((reading, index) => {
          if (recent.length > 6 && index % 2 === 1) {
            return '';
          }
          return new Date(reading.timestamp).toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
          });
        }),
        data: recent.map((reading) => reading.value ?? 0),
      };
    });
  }, [summaries]);

  const renderSummaryCard = (summary: (typeof summaries)[number], index: number) => (
    <TouchableOpacity
      key={summary.sensorId}
      style={[styles.card, {
        width: cardLayout.cardWidth,
        marginRight: index % cardLayout.columns === cardLayout.columns - 1 ? 0 : cardLayout.spacing,
      }]}
      onPress={() => navigation.navigate('SensorDetail', { sensorId: summary.sensorId })}
      activeOpacity={0.85}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.sensorTitle}>Sensor {summary.sensorId}</Text>
        <Text style={styles.readingsCount}>{summary.readings.length} leituras</Text>
      </View>

      <View style={styles.metricsRow}>
        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>Último</Text>
          <Text style={styles.metricValue}>{summary.latest?.value?.toFixed(2) ?? 'N/A'}</Text>
        </View>
        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>Média</Text>
          <Text style={styles.metricValue}>{summary.average?.toFixed(2) ?? 'N/A'}</Text>
        </View>
        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>Mínimo</Text>
          <Text style={styles.metricValue}>{summary.min?.toFixed(2) ?? 'N/A'}</Text>
        </View>
        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>Máximo</Text>
          <Text style={styles.metricValue}>{summary.max?.toFixed(2) ?? 'N/A'}</Text>
        </View>
      </View>

      <Text style={styles.timestampText}>
        Atualizado em {summary.latest ? new Date(summary.latest.timestamp).toLocaleString('pt-BR') : 'N/A'}
      </Text>
    </TouchableOpacity>
  );

  const renderCharts = () => (
    <View style={styles.gridContainer}>
      {chartData.map((chart, index) => (
        <TouchableOpacity
          key={chart.sensorId}
          style={[styles.chartCard, {
            width: chartLayout.width,
            marginRight: index % chartLayout.columns === chartLayout.columns - 1 ? 0 : chartLayout.spacing,
          }]}
          activeOpacity={0.9}
          onPress={() => navigation.navigate('SensorDetail', { sensorId: chart.sensorId })}
        >
          <Text style={styles.chartTitle}>Sensor {chart.sensorId}</Text>
          {chart.data.length ? (
            <LineChart
              data={{ labels: chart.labels, datasets: [{ data: chart.data }] }}
              width={Math.max(180, chartLayout.width - 32)}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
            />
          ) : (
            <View style={styles.noDataBox}>
              <Text style={styles.noDataText}>Sem dados recentes</Text>
            </View>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderContent = () => {
    if (loading && !summaries.length) {
      return (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loaderText}>Carregando dashboard...</Text>
        </View>
      );
    }

    if (error && !summaries.length) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      );
    }

    if (!summaries.length) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Nenhum sensor disponível</Text>
          <Text style={styles.emptyText}>Cadastre leituras para visualizar o dashboard.</Text>
        </View>
      );
    }

    if (viewMode === 'cards') {
      return (
        <View style={styles.gridContainer}>
          {summaries.map((summary, index) => renderSummaryCard(summary, index))}
        </View>
      );
    }

    return renderCharts();
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} />}
    >
      <View style={styles.headerRow}>
  <Text style={styles.title}>Dashboard</Text>
        <TouchableOpacity
          style={styles.toggleButton}
          onPress={() => setViewMode(viewMode === 'cards' ? 'charts' : 'cards')}
        >
          <Text style={styles.toggleButtonText}>
            {viewMode === 'cards' ? 'Ver gráficos' : 'Ver cards'}
          </Text>
        </TouchableOpacity>
      </View>

      {error && summaries.length > 0 && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>{error}</Text>
        </View>
      )}

      {renderContent()}
    </ScrollView>
  );
};

const chartConfig = {
  backgroundGradientFrom: '#ffffff',
  backgroundGradientTo: '#ffffff',
  decimalPlaces: 1,
  color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  style: {
    borderRadius: 16,
  },
  propsForDots: {
    r: '4',
    strokeWidth: '2',
    stroke: '#007AFF',
  },
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  toggleButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  toggleButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  headerButton: {
    marginRight: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#fff',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sensorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  readingsCount: {
    fontSize: 14,
    color: '#666',
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  metricBox: {
    width: '48%',
    backgroundColor: '#f6f8ff',
    borderRadius: 10,
    padding: 12,
    marginHorizontal: 4,
    alignItems: 'center',
    marginBottom: 8,
  },
  metricLabel: {
    fontSize: 12,
    color: '#555',
    marginBottom: 6,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  timestampText: {
    marginTop: 12,
    fontSize: 12,
    color: '#888',
    textAlign: 'right',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    justifyContent: 'flex-start',
  },
  chartCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  chart: {
    borderRadius: 16,
  },
  noDataBox: {
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noDataText: {
    color: '#666',
  },
  loaderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loaderText: {
    marginTop: 12,
    color: '#666',
  },
  errorContainer: {
    backgroundColor: '#FDECEA',
    borderRadius: 12,
    padding: 16,
  },
  errorText: {
    color: '#B3261E',
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  emptyText: {
    color: '#666',
    textAlign: 'center',
  },
  errorBanner: {
    backgroundColor: '#FFF4E5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F9C784',
  },
  errorBannerText: {
    color: '#8A4B16',
    textAlign: 'center',
  },
});

export default DashboardScreen;
