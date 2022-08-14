export interface DataSourceState {
  hasMore: boolean;
  loading: boolean;
  total?: number;
}

export interface OrderField {
  key: string;
  name: string;
}
