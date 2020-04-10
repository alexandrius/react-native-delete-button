import { createIconSet } from "@expo/vector-icons";
import React from "react";
import { Animated } from "react-native";

const DeleteIconFont = createIconSet(
   {
      Bottom: 59648,
      Top: 59649,
   },
   "icon"
);

class Icon extends React.Component {
   render() {
      return <DeleteIconFont {...this.props} />;
   }
}

export default Animated.createAnimatedComponent(Icon);
