import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLanguage } from '@/contexts/LanguageContext';

type AppLanguage = 'en' | 'sw';

const content: Record<AppLanguage, any> = {
  en: {
    headerTitle: 'Privacy Policy',
    lastUpdated: 'Last updated: January 1, 2025',
    sections: [
      {
        title: '1. Information We Collect',
        text: 'We collect information that you provide directly to us, including:',
        bullets: [
          'Personal information (name, email address, phone number)',
          'Wedding planning details and preferences',
          'Communication history with vendors',
          'Payment and transaction information',
          'Device and usage information',
        ],
      },
      {
        title: '2. How We Use Your Information',
        text: 'We use the information we collect to:',
        bullets: [
          'Provide, maintain, and improve our Services',
          'Process transactions and send related information',
          'Send you technical notices and support messages',
          'Respond to your comments and questions',
          'Connect you with wedding vendors and service providers',
          'Personalize your wedding planning experience',
        ],
      },
      {
        title: '3. Information Sharing',
        text: 'We may share your information with:',
        bullets: [
          'Vendors and service providers you choose to work with',
          'Service providers who perform services on our behalf',
          'Professional advisers and authorities when required by law',
          'Other parties with your consent',
        ],
      },
      {
        title: '4. Data Security',
        text: 'We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet is 100% secure.',
      },
      {
        title: '5. Data Retention',
        text: 'We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law.',
      },
      {
        title: '6. Your Rights',
        text: 'You have the right to:',
        bullets: [
          'Access your personal information',
          'Correct inaccurate information',
          'Request deletion of your information',
          'Object to processing of your information',
          'Request restriction of processing',
          'Data portability',
          'Withdraw consent at any time',
        ],
      },
      {
        title: '7. Cookies and Tracking',
        text: 'We use cookies and similar tracking technologies to collect and track information about your use of our Services. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.',
      },
      {
        title: '8. Third-Party Services',
        text: 'Our Services may contain links to third-party websites and services. We are not responsible for the privacy practices of these third parties. We encourage you to read their privacy policies.',
      },
      {
        title: '9. Children\'s Privacy',
        text: 'Our Services are not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you become aware that a child has provided us with personal information, please contact us.',
      },
      {
        title: '10. Changes to This Policy',
        text: 'We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.',
      },
      {
        title: '11. Contact Us',
        text: 'If you have any questions about this Privacy Policy, please contact us at:',
      },
    ],
    contactEmail: 'privacy@thefesta.com',
    contactPhone: '+255 123 456 789',
    contactAddress: 'Dar es Salaam, Tanzania',
  },
  sw: {
    headerTitle: 'Sera ya Faragha',
    lastUpdated: 'Imesasishwa: Januari 1, 2025',
    sections: [
      {
        title: '1. Taarifa Tunazokusanya',
        text: 'Tunakusanya taarifa unazotupa moja kwa moja, ikiwa ni pamoja na:',
        bullets: [
          'Taarifa binafsi (jina, anwani ya barua pepe, nambari ya simu)',
          'Maelezo ya upangaji wa harusi na mapendeleo',
          'Historia ya mawasiliano na wauzaji',
          'Taarifa za malipo na muamala',
          'Taarifa za kifaa na matumizi',
        ],
      },
      {
        title: '2. Jinsi Tunavyotumia Taarifa Zako',
        text: 'Tunatumia taarifa tunazokusanya ili:',
        bullets: [
          'Kutoa, kudumisha, na kuboresha Huduma zetu',
          'Kusindika miamala na kutuma taarifa zinazohusiana',
          'Kukutumia notisi za kiufundi na ujumbe wa msaada',
          'Kujibu maoni na maswali yako',
          'Kukunganisha na wauzaji wa harusi na watoa huduma',
          'Kubinafsisha uzoefu wako wa upangaji wa harusi',
        ],
      },
      {
        title: '3. Kushiriki Taarifa',
        text: 'Tunaweza kushiriki taarifa zako na:',
        bullets: [
          'Wauzaji na watoa huduma unaochagua kufanya kazi nao',
          'Watoa huduma wanaofanya huduma kwa niaba yetu',
          'Washauri wa kitaaluma na mamlaka zinapohitajika na sheria',
          'Wahusika wengine kwa idhini yako',
        ],
      },
      {
        title: '4. Usalama wa Data',
        text: 'Tunatekeleza hatua za kiufundi na za kiashiria zinazofaa kulinda taarifa zako binafsi dhidi ya ufikiaji usioidhinishwa, mabadiliko, kufunuliwa, au uharibifu. Hata hivyo, hakuna njia ya usafirishaji kupitia Mtandao ni salama 100%.',
      },
      {
        title: '5. Uhifadhi wa Data',
        text: 'Tunahifadhi taarifa zako binafsi kwa muda unaohitajika kutimiza madhumuni yaliyoainishwa katika Sera hii ya Faragha, isipokuwa kipindi kirefu cha uhifadhi kinahitajika au kinaruhusiwa na sheria.',
      },
      {
        title: '6. Haki Zako',
        text: 'Una haki ya:',
        bullets: [
          'Kufikia taarifa zako binafsi',
          'Kusahihisha taarifa zisizo sahihi',
          'Kuomba kufutwa kwa taarifa zako',
          'Kupinga usindikaji wa taarifa zako',
          'Kuomba kikomo cha usindikaji',
          'Uhamishaji wa data',
          'Kuondoa idhini wakati wowote',
        ],
      },
      {
        title: '7. Vidakuzi na Ufuatiliaji',
        text: 'Tunatumia vidakuzi na teknolojia sawa za ufuatiliaji kukusanya na kufuatilia taarifa kuhusu matumizi yako ya Huduma zetu. Unaweza kuagiza kivinjari chako kukataa vidakuzi vyote au kuonyesha kidakuzi kinapotumwa.',
      },
      {
        title: '8. Huduma za Wahusika Wengine',
        text: 'Huduma zetu zinaweza kuwa na viungo vya tovuti na huduma za wahusika wengine. Hatuwajibiki kwa mazoea ya faragha ya wahusika hawa wengine. Tunakuhimiza kusoma sera zao za faragha.',
      },
      {
        title: '9. Faragha ya Watoto',
        text: 'Huduma zetu hazikukusudiwa watoto chini ya umri wa miaka 13. Hatukusanyi kwa kukusudia taarifa binafsi kutoka kwa watoto chini ya 13. Ikiwa utafahamu kuwa mtoto ametupa taarifa binafsi, tafadhali wasiliana nasi.',
      },
      {
        title: '10. Mabadiliko ya Sera Hii',
        text: 'Tunaweza kusasisha Sera hii ya Faragha mara kwa mara. Tutakuarifu juu ya mabadiliko yoyote kwa kuchapisha Sera mpya ya Faragha kwenye ukurasa huu na kusasisha tarehe ya "Imesasishwa".',
      },
      {
        title: '11. Wasiliana Nasi',
        text: 'Ikiwa una maswali yoyote kuhusu Sera hii ya Faragha, tafadhali wasiliana nasi kwa:',
      },
    ],
    contactEmail: 'privacy@thefesta.com',
    contactPhone: '+255 123 456 789',
    contactAddress: 'Dar es Salaam, Tanzania',
  },
};

export function PrivacyPolicyScreen() {
  const navigation = useNavigation();
  const { language, setLanguage } = useLanguage();
  
  const t = content[language as AppLanguage];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      <LinearGradient
        colors={['#faf9f6', '#ffffff', '#faf9f6']}
        style={styles.backgroundGradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#6a1b9a" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t.headerTitle}</Text>
          <TouchableOpacity
            onPress={() => setLanguage(language === 'en' ? 'sw' : 'en')}
            style={styles.languageToggle}
          >
            <Text style={styles.languageText}>
              {language === 'en' ? '🇺🇸 EN' : '🇹🇿 SW'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            {/* Last Updated */}
            <View style={styles.updateInfo}>
              <Ionicons name="time-outline" size={16} color="#7a7a7a" />
              <Text style={styles.updateText}>{t.lastUpdated}</Text>
            </View>

            {/* Sections */}
            {t.sections.map((section: any, index: number) => (
              <View key={index} style={styles.section}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
                <Text style={styles.sectionText}>{section.text}</Text>
                {section.bullets && section.bullets.map((bullet: string, bulletIndex: number) => (
                  <View key={bulletIndex} style={styles.bulletPoint}>
                    <Text style={styles.bullet}>•</Text>
                    <Text style={styles.bulletText}>{bullet}</Text>
                  </View>
                ))}
              </View>
            ))}

            {/* Contact Information */}
            <View style={styles.contactInfo}>
              <View style={styles.contactRow}>
                <Ionicons name="mail-outline" size={18} color="#6a1b9a" />
                <Text style={styles.contactText}>{t.contactEmail}</Text>
              </View>
              <View style={styles.contactRow}>
                <Ionicons name="call-outline" size={18} color="#6a1b9a" />
                <Text style={styles.contactText}>{t.contactPhone}</Text>
              </View>
              <View style={styles.contactRow}>
                <Ionicons name="location-outline" size={18} color="#6a1b9a" />
                <Text style={styles.contactText}>{t.contactAddress}</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#faf9f6',
  },
  backgroundGradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(106, 27, 154, 0.1)',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2e2e2e',
  },
  languageToggle: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(106, 27, 154, 0.1)',
    borderWidth: 1,
    borderColor: '#6a1b9a',
  },
  languageText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6a1b9a',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  content: {
    paddingBottom: 40,
  },
  updateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(106, 27, 154, 0.05)',
    borderRadius: 8,
  },
  updateText: {
    fontSize: 12,
    color: '#7a7a7a',
    marginLeft: 8,
    fontStyle: 'italic',
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2e2e2e',
    marginBottom: 12,
  },
  subsectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4a4a4a',
    marginTop: 12,
    marginBottom: 8,
  },
  sectionText: {
    fontSize: 14,
    color: '#4a4a4a',
    lineHeight: 22,
    marginBottom: 12,
  },
  bulletPoint: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingLeft: 8,
  },
  bullet: {
    fontSize: 14,
    color: '#6a1b9a',
    marginRight: 8,
    fontWeight: '700',
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    color: '#4a4a4a',
    lineHeight: 22,
  },
  contactInfo: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(106, 27, 154, 0.15)',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  contactText: {
    fontSize: 14,
    color: '#2e2e2e',
    marginLeft: 12,
    fontWeight: '500',
  },
});

