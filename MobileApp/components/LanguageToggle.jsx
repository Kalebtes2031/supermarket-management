// LanguageToggle.jsx
import React, { useContext } from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { LanguageContext } from '@/context/LanguageProvider';


const LanguageToggle = () => {
  const { currentLanguage, toggleLanguage } = useContext(LanguageContext);

  return (
    <TouchableOpacity onPress={toggleLanguage} style={{ flexDirection: "row" }}>
      <View style={{ backgroundColor: currentLanguage === "EN" ? "#55B051":"#fff", borderTopLeftRadius: 10, borderBottomLeftRadius: 10, paddingHorizontal: 8, paddingVertical: 4 }}>
        <Text style={{ 
            color: currentLanguage === "EN" ?"#fff":"#55B051", 
            fontSize: 12 }}>
          {currentLanguage === "EN" ? "EN" : "አማ"}
        </Text>
      </View>
      <View style={{ backgroundColor:currentLanguage === "EN" ? "#fff": "#55B051", borderTopRightRadius: 10, borderBottomRightRadius: 10, paddingHorizontal: 8, paddingVertical: 4 }}>
        <Text style={{ color: currentLanguage === "EN" ?"#55B051":"#fff", fontSize: 12 }}>
          {currentLanguage === "EN" ? "አማ" : "EN"}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default LanguageToggle;
