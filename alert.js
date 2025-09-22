import { Alert, Platform } from "react-native";

const alertPolyfill = (title, description, options, extra) => {
  const result = window.confirm(
    [title, description].filter(Boolean).join("\n")
  );

  if (result) {
    // pilih opsi yang ada onPress
    const confirmOption = options.find(
      (opt) => typeof opt.onPress === "function"
    );
    confirmOption && confirmOption.onPress();
  } else {
    const cancelOption = options.find(
      (opt) => opt.onPress && (opt.style === "cancel" || !opt.style)
    );
    cancelOption && cancelOption.onPress();
  }
};

const alert = Platform.OS === "web" ? alertPolyfill : Alert.alert;

export default alert;
