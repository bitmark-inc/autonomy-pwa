export class AppSettings {
  public static DEFAULT_CHART_COLOR = '#EEEEEE';
  public static CHART_COLORS: string[] = ['#00B0DA', '#FDB515', '#EE1F60','#CFDD45', '#D9661F', '#00A598'];
  public static PLACE_NONE_COLOR: string = '#DDD5C7';
  public static PLACE_LIGHT_COLORS: {from: number, to: number, code: string}[] = [
    {from: 0, to: 1.5, code: '#E59898'},
    {from: 1.6, to: 2.5, code: '#EDBD95'},
    {from: 2.6, to: 3.5, code: '#F3D98B'},
    {from: 3.6, to: 4.5, code: '#CCE09F'},
    {from: 4.6, to: 5, code: '#96E49B'}
  ];
  public static PLACE_DARK_COLORS: {from: number, to: number, code: string}[] = [
    {from: 0, to: 1.5, code: '#CC3232'},
    {from: 1.6, to: 2.5, code: '#DB7B2B'},
    {from: 2.6, to: 3.5, code: '#E7B416'},
    {from: 3.6, to: 4.5, code: '#99C140'},
    {from: 4.6, to: 5, code: '#2DC937'}
  ];
}
