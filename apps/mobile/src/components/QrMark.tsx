import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import qrcode from 'qrcode-generator';
import { colors, radius } from '../theme/tokens';

export function QrMark({ value }: { value: string }) {
  const cells = useMemo(() => {
    const qr = qrcode(0, 'M');
    qr.addData(value);
    qr.make();
    const count = qr.getModuleCount();
    const dark: boolean[] = [];
    for (let row = 0; row < count; row += 1) {
      for (let column = 0; column < count; column += 1) dark.push(qr.isDark(row, column));
    }
    return { count, dark };
  }, [value]);

  const quiet = 2;
  const total = cells.count + quiet * 2;
  const cell = Math.max(3, Math.floor(180 / total));
  const size = cell * total;

  return (
    <View style={[styles.frame, { width: size + 16, height: size + 16 }]}>
      <View style={{ width: size, height: size, flexDirection: 'row', flexWrap: 'wrap' }}>
        {Array.from({ length: total * total }, (_, index) => {
          const row = Math.floor(index / total) - quiet;
          const column = (index % total) - quiet;
          const inside = row >= 0 && column >= 0 && row < cells.count && column < cells.count;
          const on = inside && cells.dark[row * cells.count + column];
          return <View key={index} style={{ width: cell, height: cell, backgroundColor: on ? colors.primary : colors.white }} />;
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    alignSelf: 'center',
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
