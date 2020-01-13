import React from 'react';
import PropTypes from 'prop-types';
import {
  View,
  ViewPropTypes
} from 'react-native';

const MyView = (props) => {
  const { children, hide, style } = props;
  if (hide) {
    return null;
  }
  return (
    <View {...this.props} style={style}>
      { children }
    </View>
  );
};

MyView.propTypes = {
  style: ViewPropTypes.style,
  hide: PropTypes.bool,
};

export default MyView;
