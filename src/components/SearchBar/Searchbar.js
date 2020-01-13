import React from "react";
import {
  TextInput,
  StyleSheet
} from "react-native";
const searchBar = props => ( <
  TextInput underlineColorAndroid = "transparent" { ...props
  }
  style = {
    [styles.input, props.style, !props.valid && props.touched ? styles.invalid : null]
  }
  />
);

const styles = StyleSheet.create({
  input: {
    width: "100%",
    borderWidth: 2,
    borderColor: "#eee",
    padding: 5,
    marginTop: 4,
    marginBottom: 4,
    borderRadius: 10,
    backgroundColor: 'white',
    paddingHorizontal: 16,
  },
  invalid: {
    backgroundColor: '#f9c0c0',
    borderColor: "red"
  }
});

export default searchBar;
