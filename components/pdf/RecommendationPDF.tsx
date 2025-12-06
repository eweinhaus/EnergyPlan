import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer';
import { Recommendation, EnergyPlanFormData, PDFOptions } from '@/lib/types';

// Register fonts (optional - will use default if not available)
// Font.register({
//   family: 'Helvetica',
//   src: 'https://fonts.gstatic.com/s/helvetica/v12/2QAZJIx2M5c-4pnzyh9y_n-_nvCjz5Kv.ico',
// });

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica',
    fontSize: 11,
    color: '#333',
    lineHeight: 1.6,
  },
  header: {
    textAlign: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#2563eb',
    borderBottomStyle: 'solid',
    paddingBottom: 15,
    marginBottom: 25,
  },
  logo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 10,
    color: '#666',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#2563eb',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    borderBottomStyle: 'solid',
    paddingBottom: 3,
  },
  table: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderStyle: 'solid',
    marginVertical: 8,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    borderBottomStyle: 'solid',
  },
  tableHeader: {
    backgroundColor: '#f3f4f6',
    fontWeight: 'bold',
  },
  tableCell: {
    padding: 6,
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: '#e5e7eb',
    borderRightStyle: 'solid',
  },
  tableCellLast: {
    borderRightWidth: 0,
  },
  recommendation: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderStyle: 'solid',
    borderRadius: 6,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#f9fafb',
  },
  recHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  recTitle: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  recBadge: {
    backgroundColor: '#dbeafe',
    color: '#1e40af',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    fontSize: 9,
  },
  recMetrics: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  metric: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  metricValuePositive: {
    color: '#16a34a',
  },
  metricValueNegative: {
    color: '#dc2626',
  },
  metricLabel: {
    fontSize: 9,
    color: '#666',
    marginTop: 2,
  },
  explanation: {
    fontSize: 10,
    color: '#374151',
    fontStyle: 'italic',
  },
  footer: {
    marginTop: 30,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    borderTopStyle: 'solid',
    textAlign: 'center',
    fontSize: 9,
    color: '#666',
  },
});

interface RecommendationPDFProps {
  recommendations: Recommendation[];
  formData: EnergyPlanFormData;
  options?: PDFOptions;
}

export const RecommendationPDF: React.FC<RecommendationPDFProps> = ({
  recommendations,
  formData,
  options = {},
}) => {
  const currentDate = new Date().toLocaleDateString();

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>Arbor Energy</Text>
          <Text style={styles.title}>Personalized Energy Plan Recommendations</Text>
          <Text style={styles.subtitle}>Generated on {currentDate}</Text>
        </View>

        {/* Current Plan Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Current Plan</Text>
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <View style={styles.tableCell}>
                <Text>Supplier</Text>
              </View>
              <View style={styles.tableCell}>
                <Text>Rate</Text>
              </View>
              <View style={[styles.tableCell, styles.tableCellLast]}>
                <Text>Contract</Text>
              </View>
            </View>
            <View style={styles.tableRow}>
              <View style={styles.tableCell}>
                <Text>{formData.currentPlan.supplier}</Text>
              </View>
              <View style={styles.tableCell}>
                <Text>{formData.currentPlan.rate}¢/kWh</Text>
              </View>
              <View style={[styles.tableCell, styles.tableCellLast]}>
                <Text>
                  {formData.currentPlan.contractLength
                    ? `${formData.currentPlan.contractLength} months`
                    : 'Month-to-month'
                  }
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Preferences</Text>
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <View style={styles.tableCell}>
                <Text>Cost Priority</Text>
              </View>
              <View style={[styles.tableCell, styles.tableCellLast]}>
                <Text>Renewable Priority</Text>
              </View>
            </View>
            <View style={styles.tableRow}>
              <View style={styles.tableCell}>
                <Text>{formData.preferences.costPriority}%</Text>
              </View>
              <View style={[styles.tableCell, styles.tableCellLast]}>
                <Text>{formData.preferences.renewablePriority}%</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Recommendations Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Recommendations</Text>

          {recommendations.map((recommendation, index) => (
            <View key={recommendation.plan.id} style={styles.recommendation}>
              <View style={styles.recHeader}>
                <Text style={styles.recTitle}>{recommendation.plan.name}</Text>
                <Text style={styles.recBadge}>#{index + 1} Recommendation</Text>
              </View>

              <View style={styles.recMetrics}>
                <View style={styles.metric}>
                  <Text style={styles.metricValue}>
                    ${recommendation.plan.annualCost.toFixed(2)}
                  </Text>
                  <Text style={styles.metricLabel}>Annual Cost</Text>
                </View>

                <View style={styles.metric}>
                  <Text
                    style={[
                      styles.metricValue,
                      recommendation.plan.savings >= 0 ? styles.metricValuePositive : styles.metricValueNegative
                    ]}
                  >
                    {recommendation.plan.savings >= 0 ? '+' : ''}${recommendation.plan.savings.toFixed(2)}
                  </Text>
                  <Text style={styles.metricLabel}>Yearly Savings</Text>
                </View>
              </View>

              <Text style={styles.explanation}>{recommendation.explanation}</Text>
            </View>
          ))}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>
            This report was generated by the AI Energy Plan Recommendation Agent.
          </Text>
          <Text>
            Recommendations are based on your provided usage data and preferences.
          </Text>
          <Text>
            Actual costs may vary based on your specific usage patterns and market conditions.
          </Text>
        </View>
      </Page>
    </Document>
  );
};


