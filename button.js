import React, { useState, useRef } from "react";
import {
   TouchableOpacity,
   View,
   Animated,
   StyleSheet,
   Easing,
   Platform,
} from "react-native";
import Icon from "./icon";

const ICON_SIZE = 24;
const MAX_SCALE = 4;
const MAX_POSITION = 5;
const RESET_POSITION = 6;
const BUTTON_HEIGHT = 45;
const DELETE_TEXT_ARR = ["D", "e", "l", "e", "t", "e"];

const easing = Easing.bezier(0.11, 0, 0.5, 0);

const styles = StyleSheet.create({
   button: {
      height: BUTTON_HEIGHT,
      paddingHorizontal: 15,
      backgroundColor: "red",
      borderRadius: 11,
      overflow: "hidden",
      justifyContent: "center",
   },
   contentContainer: {
      flexDirection: "row",
      alignItems: "center",
      height: 100,
      width: 100,
   },
   labelContainer: {
      position: "absolute",
      height: BUTTON_HEIGHT,
      width: "100%",
      alignItems: "center",
      justifyContent: "center",
      left: 25,
   },
   letterContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
   },
   label: {
      color: "white",
      fontWeight: "bold",
   },
   top: {
      alignItems: "center",
      justifyContent: "center",
   },
   bottom: {
      alignItems: "center",
      justifyContent: "center",
      position: "absolute",
   },
});

export default function DeleteButton() {
   const [scale] = useState(new Animated.Value(1));
   const [position] = useState(new Animated.Value(1));
   const [letterAnimations] = useState(
      DELETE_TEXT_ARR.map((_) => new Animated.Value(0))
   );
   const [letterOpacities] = useState(
      DELETE_TEXT_ARR.map((_) => new Animated.Value(1))
   );
   const [width, setWidth] = useState();
   const animationFinishedRef = useRef(true);

   const ANDROID_POSITION_VALUE = ICON_SIZE / 2;

   const ANDROID_TRANSFORMS = Platform.select({
      android: [
         {
            translateX: scale.interpolate({
               inputRange: [1, MAX_SCALE],
               outputRange: [0, ANDROID_POSITION_VALUE * 2],
            }),
         },
         { scale },
         {
            translateX: 0,
         },
      ],
      ios: [],
   });

   const resetLetters = () => {
      letterOpacities.forEach((opacity, index) => {
         Animated.timing(opacity, {
            toValue: 1,
            delay: index * 50,
            duration: 200,
            easing,
         }).start();
      });
      animationFinishedRef.current = true;
   };

   const startReset = () => {
      letterOpacities.forEach((o) => o.setValue(0));
      letterAnimations.forEach((anim) => anim.setValue(0));

      Animated.timing(position, {
         toValue: MAX_POSITION,
         duration: 400,
      }).start();

      Animated.timing(scale, {
         toValue: 1,
         duration: 400,
      }).start(() => {
         setTimeout(() => {
            Animated.timing(position, {
               toValue: RESET_POSITION,
               duration: 400,
               easing: Easing.bezier(0.64, 0, 0.78, 0),
            }).start(() => {
               position.setValue(1);
               resetLetters();
            });
         }, 200);
      });
   };

   const startLetterAnimations = () => {
      letterAnimations.forEach((anim, index) => {
         Animated.timing(anim, {
            toValue: 1,
            delay: index * 60,
            duration: 300,
            easing,
         }).start(index === letterAnimations.length - 1 ? startReset : null);
      });
   };

   const startAnimation = () => {
      const config = {
         toValue: MAX_SCALE,
         duration: 600,
         easing: Easing.bezier(0.25, 1, 0.5, 1),
      };
      Animated.timing(position, config).start();
      Animated.timing(scale, config).start(startLetterAnimations);
   };

   const topTransforms = [
      {
         translateY: position.interpolate({
            inputRange: [1, MAX_SCALE, MAX_POSITION, RESET_POSITION],
            outputRange: [0, Platform.select({ ios: 7, android: 17 }), 0, 0],
         }),
      },
      {
         translateX: position.interpolate({
            inputRange: [1, MAX_SCALE, MAX_POSITION, RESET_POSITION],
            outputRange: [0, Platform.select({ ios: 3, android: 20 }), 40, 0],
         }),
      },
      {
         rotateZ: position.interpolate({
            inputRange: [1, MAX_SCALE, MAX_POSITION, RESET_POSITION],
            outputRange: ["0deg", "-15deg", "0deg", "0deg"],
         }),
      },
      ...ANDROID_TRANSFORMS,
   ];

   const bottomTransforms = [
      {
         translateY: position.interpolate({
            inputRange: [1, MAX_SCALE, MAX_POSITION, RESET_POSITION],
            outputRange: [0, Platform.select({ ios: 20, android: 23 }), 0, 0],
         }),
      },
      {
         translateX: position.interpolate({
            inputRange: [1, MAX_SCALE, MAX_POSITION, RESET_POSITION],
            outputRange: [0, Platform.select({ ios: -2, android: 14 }), 40, 0],
         }),
      },
      {
         rotateZ: position.interpolate({
            inputRange: [1, MAX_SCALE, MAX_POSITION, RESET_POSITION],
            outputRange: ["0deg", "1deg", "0deg", "0deg"],
         }),
      },
      ...ANDROID_TRANSFORMS,
   ];

   const iconSize = Platform.select({
      ios: Animated.multiply(ICON_SIZE, scale),
      android: ICON_SIZE,
   });

   const letterContainerTransforms = [
      {
         rotateZ: scale.interpolate({
            inputRange: [1, MAX_SCALE],
            outputRange: ["0deg", "-15deg"],
         }),
      },
      {
         translateY: scale.interpolate({
            inputRange: [1, MAX_SCALE],
            outputRange: [0, -3],
         }),
      },
   ];

   const getLetterTransforms = (i) => [
      {
         translateX: letterAnimations[i].interpolate({
            inputRange: [0, 1],
            outputRange: [0, -8 * i],
         }),
      },
      {
         translateY: letterAnimations[i].interpolate({
            inputRange: [0, 1],
            outputRange: [0, 20],
         }),
      },
      {
         rotateZ: letterAnimations[i].interpolate({
            inputRange: [0, 1],
            outputRange: ["0deg", "-5deg"],
         }),
      },
   ];

   return (
      <TouchableOpacity
         onLayout={({ nativeEvent }) => {
            const { layout } = nativeEvent;
            if (!width && layout.width) {
               //Don't change boundaries on iOS since we are animat
               setWidth(layout.width);
            }
         }}
         activeOpacity={0.8}
         style={[styles.button, { width }]}
         onPress={() => {
            if (animationFinishedRef.current) {
               animationFinishedRef.current = false;
               startAnimation();
            }
         }}
      >
         <View style={styles.contentContainer}>
            <View>
               {/* TOP */}
               <Animated.View
                  style={{
                     ...styles.top,
                     transform: topTransforms,
                  }}
               >
                  <Icon name="Top" color="white" size={iconSize} />
               </Animated.View>
               {/*BOTTOM */}
               <Animated.View
                  style={{
                     ...styles.bottom,
                     transform: bottomTransforms,
                  }}
               >
                  <Icon name="Bottom" color="white" size={iconSize} />
               </Animated.View>
            </View>
         </View>
         <View style={styles.labelContainer}>
            <Animated.View
               style={{
                  ...styles.letterContainer,
                  transform: letterContainerTransforms,
               }}
            >
               {DELETE_TEXT_ARR.map((l, i) => {
                  const opacity = letterOpacities[i];

                  return (
                     <Animated.Text
                        key={i.toString()}
                        style={{
                           ...styles.label,
                           opacity,
                           transform: getLetterTransforms(i),
                        }}
                     >
                        {l}
                     </Animated.Text>
                  );
               })}
            </Animated.View>
         </View>
      </TouchableOpacity>
   );
}
