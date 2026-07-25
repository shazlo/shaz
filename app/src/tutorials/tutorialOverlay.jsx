import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
  TouchableWithoutFeedback,
  Image,
} from "react-native";
import { useTutorial } from "./TutorialManager";

const { width, height } = Dimensions.get("window");

/* 🔹 Pulsing glowing marker for TAP targets */
const GlowMarker = ({ x, y }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(scaleAnim, { toValue: 1.4, duration: 800, useNativeDriver: true }),
          Animated.timing(opacityAnim, { toValue: 0.5, duration: 800, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(scaleAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
          Animated.timing(opacityAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ]),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={{
        position: "absolute",
        left: x * width - 25,
        top: y * height - 25,
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: "rgba(0, 0, 0, 0.2)",
        borderWidth: 2,
        borderColor: "white",
        transform: [{ scale: scaleAnim }],
        opacity: opacityAnim,
        shadowColor: "#fff",
        shadowOpacity: 0.8,
        shadowRadius: 15,
        elevation: 10,
      }}
    />
  );
};

/* 🔹 Orb animation for swipe direction */
const SwipeOrb = ({ direction }) => {
  const moveAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = () => {
      Animated.sequence([
        Animated.timing(moveAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.timing(moveAnim, { toValue: 0, duration: 1000, useNativeDriver: true }),
      ]).start(loop);
    };
    loop();
  }, []);

  const transform =
    direction === "right"
      ? [{ translateX: moveAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 120] }) }]
      : direction === "left"
      ? [{ translateX: moveAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -120] }) }]
      : direction === "up"
      ? [{ translateY: moveAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -120] }) }]
      : [{ translateY: moveAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 120] }) }];

  return <Animated.View style={[styles.orb, { transform }]} />;
};

/* 🔹 Floating dialog for captions & navigation */
const TutorialDialog = ({ title, description, onNext, onBack, isLast, step }) => (
  <View style={styles.dialogContainer}>
    {title && <Text style={styles.dialogTitle}>{title}</Text>}
    {description && <Text style={styles.dialogDescription}>{description}</Text>}

    <View style={styles.buttonRow}>
      {step > 0 && (
        <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={onBack}>
          <Text style={styles.secondaryText}>Back</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity style={[styles.button, styles.primaryButton]} onPress={onNext}>
        <Text style={styles.primaryText}>{isLast ? "Got it!" : "Next"}</Text>
      </TouchableOpacity>
    </View>
  </View>
);

/* 🔹 All Tutorial Steps */
const tutorialSteps = [
  {
  intro: true,
  logo: require("../assets/images/shazlo-logo-v4.png"),
  tagline:
    "Your personal fashion discovery app.\nFind outfits tailored to your style in seconds\n\nExplore curated products from leading brands and discover your next favourite look.",
},
  {
    title: "Swipe Right to Like ❤️",
    description: "Found something you love? Swipe right to add it to your style preferences.",
    gesture: "right",
    position: "bottom",
  },
  {
    title: "Swipe Left to Pass 👎",
    description: "Not your vibe? Swipe left to skip and see more styles.",
    gesture: "left",
    position: "bottom",
  },
  // {
  //   title: "Swipe Up to Add to Cart 🛍️",
  //   description: "Love it enough to buy it? Swipe up to add it to your cart instantly.",
  //   gesture: "up",
  //   position: "bottom",
  // },
  {
    title: "Swipe Down to Save ",
    description: "Not sure yet? Swipe down to save the item to your closet for later.",
    gesture: "down",
    position: "bottom",
  },
  {
    title: "The Function ",
    description:
      "Every swipe teaches the app your taste. Shazlo learns your style and finds perfect outfits for you.",
    position: "center",
  },
  // {
  //   title: "Tap Here to Go to Product Page",
  //   description: "To go to website to actually buy the product you found on Shazlo",
  //   tapMarker: { x: 0.88, y: 0.9 },
  //   position: "center",
  // },
  // {
  //   title: "Tap Here to Learn More ",
  //   description: "Tap the info icon to see more about the product — details and return policy.",
  //   tapMarker: { x: 0.85, y: 0.25 },
  //   position: "bottom",
  // },
  {
    title: "Navigate Images ",
    description:
      "Tap on the right or left half of the card to browse through multiple angles of the outfit.",
    tapMarker: { x: 0.8, y: 0.5 },
    position: "bottom",
  },
  {
    title: "Select Gender",
    filter:true,
    description:
      "Tap here to toggle between women's and men's clothing.",
    tapMarker: { x: 0.1, y: 0.15 },
    position: "bottom",
  },
  {
    title: "You're All Set ✨",
    description:
      "That’s all you need to know. Now, the rest is yours to explore — make it your own fashion world.",
    position: "center",
    isLast: true,
  },
];

/* 🔹 Main Overlay */
const GameTutorialOverlay = ({ children }) => {
  const { tutorialActive, currentStep, nextStep, setCurrentStep, endTutorial } = useTutorial();
  const stepConfig = tutorialSteps[currentStep] || {};

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (stepConfig.intro) {
      fadeAnim.setValue(0);
      Animated.timing(fadeAnim, { toValue: 1, duration: 1500, useNativeDriver: true }).start();
    }
  }, [stepConfig]);

  if (!tutorialActive) return children;
 const isIntro = stepConfig.intro === true;
 const isFilter = stepConfig.filter === true;
  return (
   <View style={styles.container}>
  {children}

  {/* Background overlay at zIndex: 0 */}
  <View style={[styles.darkOverlay, { zIndex: isIntro || isFilter ? 2 : 0 }]} />


  {/* Foreground tutorial UI at zIndex: 2 */}
  <View style={styles.foreground}>
    {/* Intro cinematic */}
    {stepConfig.intro && (
      <View style={styles.introContainer}>
        <Animated.Image
          source={stepConfig.logo}
          style={[
            styles.logo,
            {
              opacity: fadeAnim,
              transform: [
                {
                  scale: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1],
                  }),
                },
              ],
            },
          ]}
        />

        <Animated.Text
          style={[
            styles.tagline,
            {
              opacity: fadeAnim,
              transform: [
                {
                  translateY: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [30, 0],
                  }),
                },
              ],
            },
          ]}
        >
          {stepConfig.tagline}
        </Animated.Text>

        <TouchableOpacity style={styles.continueButton} onPress={nextStep}>
          <Text style={{ color: "black", fontWeight: "600" }}>Next</Text>
        </TouchableOpacity>
      </View>
    )}

    {/* Gesture animations */}
    {stepConfig.gesture && <SwipeOrb direction={stepConfig.gesture} />}
    {stepConfig.tapMarker && <GlowMarker x={stepConfig.tapMarker.x} y={stepConfig.tapMarker.y} />}

    {/* Dialog */}
    {!stepConfig.intro && (
      <View
        style={[
          styles.dialogWrapper,
          stepConfig.position === "top"
            ? { top: 100 }
            : stepConfig.position === "bottom"
            ? { bottom: 100 }
            : { justifyContent: "center" },
        ]}
      >
        <TutorialDialog
          title={stepConfig.title}
          description={stepConfig.description}
          step={currentStep}
          isLast={stepConfig.isLast}
          onNext={stepConfig.isLast ? endTutorial : nextStep}
          onBack={() => setCurrentStep(currentStep - 1)}
        />
      </View>
    )}
  </View>
</View>

  );
};

export default GameTutorialOverlay;

/* 🔹 Styles */
const styles = StyleSheet.create({
  container: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.85)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  darkOverlay: {
  ...StyleSheet.absoluteFillObject,
  backgroundColor: "rgba(0,0,0,0.85)",
  zIndex: 0,
},

foreground: {
  ...StyleSheet.absoluteFillObject,
  zIndex: 2,
  alignItems: "center",
  justifyContent: "center",
},

  introContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 300,
    height: 300,
    resizeMode: "contain",
    marginBottom: 25,
  },
  tagline: {
    color: "white",
    fontSize: 18,
    textAlign: "center",
    paddingHorizontal: 40,
    lineHeight: 26,
    fontWeight: "400",
    fontStyle: "italic",
  },
  continueButton: {
    backgroundColor: "white",
    paddingHorizontal: 26,
    paddingVertical: 10,
    borderRadius: 25,
    marginTop: 35,
  },
  dialogWrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
  },
  dialogContainer: {
    backgroundColor: "rgba(30,30,30,0.95)",
    borderRadius: 18,
    padding: 20,
    marginHorizontal: 20,
    alignItems: "center",
  },
  dialogTitle: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  dialogDescription: {
    color: "#ddd",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 15,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 25,
    minWidth: 100,
    alignItems: "center",
  },
  primaryButton: { backgroundColor: "white" },
  secondaryButton: { borderColor: "white", borderWidth: 1 },
  primaryText: { color: "black", fontWeight: "bold", fontSize: 16 },
  secondaryText: { color: "white", fontWeight: "bold", fontSize: 16 },
  orb: {
    position: "absolute",
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    shadowColor: "#fff",
    shadowOpacity: 1,
    shadowRadius: 15,
    elevation: 12,
  },
});
