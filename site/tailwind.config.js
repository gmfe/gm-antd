const colors = require('tailwindcss/colors')

module.exports = {
  mode: 'jit',
  prefix: 'tw-',
  purge: [
    '**/*.ts',
    '**/*.tsx',
    '**/*.md',
  ],
  theme: {
    extend: {
      transitionProperty: {
        width: 'width',
        height: 'height',
        spacing: 'margin, padding',
      },
    },
    fontFamily: {
      'family-medium': [
        'PingFangSC-Medium',
        'PingFang SC',
        'Segoe UI',
        'Lucida Grande',
        'Helvetica, Arial',
        'Microsoft YaHei',
        'FreeSans, Arimo',
        'Droid Sans',
        'wenquanyi micro hei',
        'Hiragino Sans GB',
        'Hiragino Sans GB W3',
        'FontAwesome',
        'sans-serif',
      ],
      'family-regular': [
        'PingFangSC-Regular',
        'PingFang SC',
        'Segoe UI',
        'Lucida Grande',
        'Helvetica, Arial',
        'Microsoft YaHei',
        'FreeSans, Arimo',
        'Droid Sans',
        'wenquanyi micro hei',
        'Hiragino Sans GB',
        'Hiragino Sans GB W3',
        'FontAwesome',
        'sans-serif',
      ],
    },
    colors: {
      ...colors,
      primary: '#0363FF',
      success: '#52c41a',
      warning: '#faad14',
      error: '#f5222d',
      transparent: 'transparent',
      blue: {
        ...colors.blue,
        DEFAULT: '#0363FF',
        light: '#DCE9FF',
        'light(#DCE9FF|rgba(3,99,255,0.8))': '#DCE9FF',
        second: '#C3DAFF',
        'second(#C3DAFF|rgba(3,99,255,0.24))': '#C3DAFF',
      },
      green: {
        ...colors.green,
        DEFAULT: '#53c419',
        light: '#53C419',
        'light(#53C419|rgba(83,196,25,0.8))': '#53C419',
      },
      orange: {
        ...colors.orange,
        DEFAULT: '#ff7d01',
        light: '#FF7D01',
      },
      red: {
        ...colors.red,
        DEFAULT: '#ff4d4f',
        light: '#ff4d4f',
      },
      gray: {
        ...colors.gray,
        DEFAULT: '#1f1f1f',
        light: '#F0F0F0',
      },
      black: {
        ...colors.black,
        DEFAULT: '#000',
        light: '#333',
      },
    },
  },
  variants: {
    extend: {
      transform: [
        'responsive',
        'group-hover',
        'focus-within',
        'hover',
        'focus',
      ],
      translate: [
        'responsive',
        'group-hover',
        'focus-within',
        'hover',
        'focus',
      ],
      width: ['responsive', 'group-hover', 'focus-within', 'hover', 'focus'],
      height: ['responsive', 'group-hover', 'focus-within', 'hover', 'focus'],
    },
  },
}
