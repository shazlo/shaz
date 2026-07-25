import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  Share,
  Linking
} from "react-native";
import LinearGradient from "react-native-linear-gradient";

const { width } = Dimensions.get("window");

export default function TutorialCard() {

  const shareItem = async () => {
    try {
      await Share.share({
        message: "Check this product! https://www.shazlo.store",
      });
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <View style={styles.card}>

      {/* SHARE ICON */}
      <TouchableOpacity
        style={styles.share}
        onPress={shareItem}
      >
        <Image
          source={require("../assets/images/share.png")}
          style={styles.icon}
        />
      </TouchableOpacity>

      {/* INFO ICON */}
      <TouchableOpacity
        style={styles.info}
      >
        <Image
          source={require("../assets/images/info.png")}
          style={styles.icon}
        />
      </TouchableOpacity>

      {/* IMAGE */}
      <Image
        source={require("../assets/images/men-filter.jpg")}
        style={styles.image}
        resizeMode="cover"
      />

      {/* BOTTOM GRADIENT */}
      <LinearGradient
        colors={["rgba(0,0,0,1)", "rgba(0,0,0,0.6)", "transparent"]}
        start={{ x: 0, y: 1 }}
        end={{ x: 0, y: 0 }}
        style={styles.bottom}
      >

        {/* SIZE MOCK */}
        <View style={styles.sizeRow}>
          {["S","M","L"].map(size => (
            <View key={size} style={styles.sizeBox}>
              <Text style={styles.sizeText}>{size}</Text>
            </View>
          ))}
        </View>

        {/* TITLE + PRICE */}
        <View style={styles.row}>
          <Text style={styles.title} numberOfLines={2}>
            Sample Product For Demo
          </Text>

          <Text style={styles.price}>
            1999
          </Text>
        </View>

        {/* WEBSITE BUTTON */}
        <TouchableOpacity
          style={styles.website}
          onPress={() => Linking.openURL("https://www.shazlo.store")}
        >
          <Image
            source={require("../assets/images/follow.png")}
            style={{ width: 28, height: 28, tintColor: "white" }}
          />
        </TouchableOpacity>

      </LinearGradient>

    </View>
  );
}

const styles = StyleSheet.create({

  card: {
    width: width * 0.92,
    height: "72%",
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "white",
    elevation: 5,
    marginTop: 7
  },

  image: {
    width: "100%",
    height: "100%"
  },

  icon: {
    width: 30,
    height: 30,
    tintColor: "black"
  },

  share: {
    position: "absolute",
    top: 24,
    left: 20,
    zIndex: 10
  },

  info: {
    position: "absolute",
    top: 20,
    right: 20,
    zIndex: 10
  },

  bottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height:140
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding:20
  },

  title: {
    color: "white",
    fontSize: 15,
    flex: 1,
    marginRight: 8
  },

  price: {
    color: "white",
    fontSize: 35
  },

  website: {
    position: "absolute",
    right: 10,
    top: -20
  },

  sizeRow: {
    flexDirection: "row",
    marginBottom: 10
  },

  sizeBox: {
    borderWidth: 2,
    borderColor: "white",
    paddingHorizontal: 8,
    marginRight: 8
  },

  sizeText: {
    color: "white",
    fontSize: 18
  }

});