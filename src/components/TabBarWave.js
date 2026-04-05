import { Dimensions, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const { width } = Dimensions.get('window');

export default function TabBarWave() {
  return (
    <View
      style={{
        position: 'absolute',
        top: -22,
        left: 0,
        right: 0,
      }}
      pointerEvents="none"
    >
      <Svg width={width} height={90} viewBox={`0 0 ${width} 90`}>
        <Path
          d={`
            M0,30
            C${width * 0.12},10 ${width * 0.22},0 ${width * 0.32},0
            C${width * 0.42},0 ${width * 0.46},22 ${width * 0.5},22
            C${width * 0.54},22 ${width * 0.58},0 ${width * 0.68},0
            C${width * 0.78},0 ${width * 0.88},10 ${width},30
            L${width},90
            L0,90
            Z
          `}
          fill="#121212"
        />
      </Svg>
    </View>
  );
}