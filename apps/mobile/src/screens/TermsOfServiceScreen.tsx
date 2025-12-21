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
    headerTitle: 'Terms of Service',
    lastUpdated: 'Last updated: January 1, 2025',
    sections: [
      {
        title: '1. Introduction',
        text: 'Welcome to The Festa! These Terms of Service ("Terms") govern your access to and use of The Festa mobile application and services ("Services"). By accessing or using our Services, you agree to be bound by these Terms.',
      },
      {
        title: '2. Account Registration',
        text: 'To use certain features of our Services, you must register for an account. You agree to:',
        bullets: [
          'Provide accurate and complete information',
          'Maintain the security of your account credentials',
          'Notify us immediately of any unauthorized use',
          'Be responsible for all activities under your account',
        ],
      },
      {
        title: '3. Use of Services',
        text: 'You may use our Services only for lawful purposes and in accordance with these Terms. You agree not to:',
        bullets: [
          'Violate any applicable laws or regulations',
          'Infringe upon the rights of others',
          'Transmit harmful or malicious code',
          'Interfere with or disrupt the Services',
        ],
      },
      {
        title: '4. Intellectual Property',
        text: 'The Services and all content, features, and functionality are owned by The Festa and are protected by international copyright, trademark, and other intellectual property laws. You may not reproduce, distribute, or create derivative works without our express written permission.',
      },
      {
        title: '5. User Content',
        text: 'You retain ownership of any content you submit to the Services. By submitting content, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, and display such content in connection with providing the Services.',
      },
      {
        title: '6. Payment Terms',
        text: 'Certain features of our Services may require payment. You agree to pay all applicable fees and charges. All payments are non-refundable unless otherwise stated. We reserve the right to change our pricing at any time.',
      },
      {
        title: '7. Termination',
        text: 'We may terminate or suspend your account and access to the Services at any time, without prior notice or liability, for any reason, including if you breach these Terms. Upon termination, your right to use the Services will immediately cease.',
      },
      {
        title: '8. Disclaimer of Warranties',
        text: 'THE SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.',
      },
      {
        title: '9. Limitation of Liability',
        text: 'TO THE MAXIMUM EXTENT PERMITTED BY LAW, THE FESTA SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY.',
      },
      {
        title: '10. Changes to Terms',
        text: 'We reserve the right to modify these Terms at any time. We will notify you of any changes by posting the new Terms on this page and updating the "Last updated" date. Your continued use of the Services after any such changes constitutes your acceptance of the new Terms.',
      },
      {
        title: '11. Contact Us',
        text: 'If you have any questions about these Terms, please contact us at:',
      },
    ],
    contactEmail: 'legal@thefesta.com',
    contactPhone: '+255 123 456 789',
    contactAddress: 'Dar es Salaam, Tanzania',
  },
  sw: {
    headerTitle: 'Masharti ya Huduma',
    lastUpdated: 'Imesasishwa: Januari 1, 2025',
    sections: [
      {
        title: '1. Utangulizi',
        text: 'Karibu The Festa! Masharti haya ya Huduma ("Masharti") yanadhibiti ufikiaji wako na matumizi ya programu ya simu ya The Festa na huduma ("Huduma"). Kwa kufikia au kutumia Huduma zetu, unakubali kufungwa na Masharti haya.',
      },
      {
        title: '2. Usajili wa Akaunti',
        text: 'Ili kutumia vipengele fulani vya Huduma zetu, lazima ujiandikishe kwa akaunti. Unakubali:',
        bullets: [
          'Kutoa taarifa sahihi na kamili',
          'Kudumisha usalama wa hati za akaunti yako',
          'Kutuarifu mara moja ikiwa kuna matumizi yasiyo na ruhusa',
          'Kuwa na wajibu wa shughuli zote chini ya akaunti yako',
        ],
      },
      {
        title: '3. Matumizi ya Huduma',
        text: 'Unaweza kutumia Huduma zetu tu kwa madhumuni ya kisheria na kwa mujibu wa Masharti haya. Unakubali kutofanya:',
        bullets: [
          'Kuvunja sheria au kanuni zozote zinazotumika',
          'Kukiuka haki za wengine',
          'Kutuma msimbo unaoharibu au ulio na nia mbaya',
          'Kuingilia kati au kuvuruga Huduma',
        ],
      },
      {
        title: '4. Mali ya Kiakili',
        text: 'Huduma na maudhui yote, vipengele, na utendaji viko miliki ya The Festa na vinalindwa na sheria za kimataifa za hakimiliki, alama za biashara, na sheria nyingine za mali ya kiakili. Huwezi kunakili, kusambaza, au kuunda kazi zinazotokana bila ruhusa yetu ya maandishi.',
      },
      {
        title: '5. Maudhui ya Mtumiaji',
        text: 'Unabaki kuwa na umiliki wa maudhui yoyote unayowasilisha kwa Huduma. Kwa kuwasilisha maudhui, unatupa leseni ya ulimwenguni, isiyo ya kipekee, bila malipo ya matumizi, kunakili, na kuonyesha maudhui kama hayo kuhusiana na kutoa Huduma.',
      },
      {
        title: '6. Masharti ya Malipo',
        text: 'Vipengele fulani vya Huduma zetu vinaweza kuhitaji malipo. Unakubali kulipa ada na malipo yote yanayotumika. Malipo yote hayarejeshwi isipokuwa amesema vinginevyo. Tunahifadhi haki ya kubadilisha bei zetu wakati wowote.',
      },
      {
        title: '7. Kusitisha',
        text: 'Tunaweza kusitisha au kusimamisha akaunti yako na ufikiaji wa Huduma wakati wowote, bila taarifa ya awali au dhima, kwa sababu yoyote, ikiwa ni pamoja na ukivunja Masharti haya. Baada ya kusitisha, haki yako ya kutumia Huduma itakoma mara moja.',
      },
      {
        title: '8. Kukataa Dhamana',
        text: 'HUDUMA ZINATOLEWA "KAMA ZILIVYO" NA "KAMA ZINAPATIKANA" BILA DHAMANA YA AINA YOYOTE, IDHINI AU KUTOELEWEKA, IKIWA NI PAMOJA NA LAKINI SILIMUMIWA KWA DHAMANA ZA BIASHARA, KUFAA KWA KUSUDI MAALUM, AU KUTOKUVUNJA.',
      },
      {
        title: '9. Kikomo cha Dhima',
        text: 'KWA KIWANGO CHA JUU KINACHORUHUSIWA NA SHERIA, THE FESTA HAITAKUWA NA WAJIBU WA UHARIBIFU WA MOJA KWA MOJA, WA KIMAKUSUDI, MAALUM, WA MATOKEO, AU WA ADHABU, AU HASARA YOYOTE YA FAIDA AU MAPATO, IWE IMEPATIKANA MOJA KWA MOJA AU KISICHO MOJA KWA MOJA.',
      },
      {
        title: '10. Mabadiliko ya Masharti',
        text: 'Tunahifadhi haki ya kurekebisha Masharti haya wakati wowote. Tutakuarifu juu ya mabadiliko yoyote kwa kuchapisha Masharti mapya kwenye ukurasa huu na kusasisha tarehe ya "Imesasishwa". Matumizi yako ya kuendelea ya Huduma baada ya mabadiliko kama hayo ni kukubali kwako kwa Masharti mapya.',
      },
      {
        title: '11. Wasiliana Nasi',
        text: 'Ikiwa una maswali yoyote kuhusu Masharti haya, tafadhali wasiliana nasi kwa:',
      },
    ],
    contactEmail: 'legal@thefesta.com',
    contactPhone: '+255 123 456 789',
    contactAddress: 'Dar es Salaam, Tanzania',
  },
};

export function TermsOfServiceScreen() {
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

