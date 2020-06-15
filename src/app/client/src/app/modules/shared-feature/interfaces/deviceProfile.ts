export interface IDeviceProfile {
  ipLocation: ILocation;
  userDeclaredLocation?: ILocation;
  userFramework?: IFramework;
}

interface ILocation {
  state: string;
  district: string;
}

interface IFramework {
  board: {};
  medium: {};
  grade: {};
  subject?: {};
}
