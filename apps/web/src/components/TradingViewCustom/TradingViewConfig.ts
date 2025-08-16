/* eslint-disable no-param-reassign */
const RED = "#D24654";
const GREEN = "#4D9C70";
export const DEFAULT_PERIOD = "4h";
export const RESOLUTION_STOGRATE = 'u2dex_resolution'
export const convertResolutionToSeconds = (resolution: string) => {
  switch (resolution) {
    case '1':
      return 60
    case '5':
      return 300
    case '15':
      return 900
    case '30':
      return 1800
    case '60':
      return 3600
    case '240':
      return 14400
    case '1D':
      return 86400
    case 'D':
      return 432000
    case '1W':
      return 604800
    case '1M':
      return 0
    default:
      return 900
  }
}
const chartStyleOverrides = ["candleStyle", "hollowCandleStyle", "haStyle"].reduce((acc: any, cv) => {
  acc[`mainSeriesProperties.${cv}.drawWick`] = true;
  acc[`mainSeriesProperties.${cv}.drawBorder`] = false;
  acc[`mainSeriesProperties.${cv}.upColor`] = GREEN;
  acc[`mainSeriesProperties.${cv}.downColor`] = RED;
  acc[`mainSeriesProperties.${cv}.wickUpColor`] = GREEN;
  acc[`mainSeriesProperties.${cv}.wickDownColor`] = RED;
  acc[`mainSeriesProperties.${cv}.borderUpColor`] = GREEN;
  acc[`mainSeriesProperties.${cv}.borderDownColor`] = RED;
  return acc;
}, {});

export const chartOverrides = {
  "paneProperties.background": "#272727",
  "paneProperties.backgroundGradientStartColor": "#272727",
  "paneProperties.backgroundGradientEndColor": "#272727",
  "paneProperties.backgroundType": "solid",
  "paneProperties.vertGridProperties.color": "#3C3C3C",
  "paneProperties.vertGridProperties.style": 0,
  "paneProperties.horzGridProperties.color": "#3C3C3C",
  "paneProperties.horzGridProperties.style": 0,
  "mainSeriesProperties.priceLineColor": "#3a3e5e",
  "scalesProperties.textColor": "#fff",
  "scalesProperties.lineColor": "#272727",
  "paneProperties.legendProperties.showSymbol": false,
  "paneProperties.legendProperties.showSeriesOHLC": true,
  "mainSeriesProperties.statusViewStyle.showInterval": false,
  // "mainSeriesProperties.minTick": '1000,1,false',
  "scalesProperties.showSymbolLabels": false,
  ...chartStyleOverrides,
};

export const disabledFeaturesOnMobile = ["header_saveload", "header_fullscreen_button"];

const disabledFeatures = [
  "volume_force_overlay",
  "show_logo_on_all_charts",
  "caption_buttons_text_if_possible",
  "create_volume_indicator_by_default",
  "header_compare",
  "compare_symbol",
  "display_market_status",
  "header_interval_dialog_button",
  "show_interval_dialog_on_key_press",
  "header_symbol_search",
  "popup_hints",
  "header_in_fullscreen_mode",
  "use_localstorage_for_settings",
  "right_bar_stays_on_scroll",
  "symbol_info",
  "timeframes_toolbar",
  "header_resolutions",
];

const enabledFeatures = [
  "side_toolbar_in_fullscreen_mode",
  "header_in_fullscreen_mode",
  "hide_resolution_in_legend",
  "items_favoriting",
  "hide_left_toolbar_by_default",
];
export const defaultChartProps = {
  theme: "dark",
  locale: "en",
  library_path: "/charting_library/",
  clientId: "tradingview.com",
  userId: "public_user_id",
  fullscreen: false,
  autosize: true,
  header_widget_dom_node: false,
  overrides: chartOverrides,
  enabled_features: enabledFeatures,
  disabled_features: disabledFeatures,
  charts_storage_api_version: '1.1',
  studies_overrides: {
    'volume.volume.color.0': '#E43650',
    'volume.volume.color.1': '#229E6C',
    'volume.volume.transparency': 1,
    'volume.show ma': !0,
    'volume.volume ma.plottype': 'line'
  },
  custom_css_url: "/charting_library/tradingview-chart.css",
  loading_screen: { backgroundColor: "#272727", foregroundColor: "#2962ff" },
  favorites: {
    intervals: ["1", "5", "15", "60", "240", "1D"],
  },
  // custom_formatters: {
  //   timeFormatter: {
  //     format: (date) => formatTVTime(date),
  //   },
  //   dateFormatter: {
  //     format: (date) => formatTVDate(date),
  //   },
  // },
};