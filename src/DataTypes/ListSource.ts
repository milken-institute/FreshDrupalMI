import JSONApiUrl from "./JSONApiUrl";
import Entity, { EntityInterface } from "./Entity";
import { ListableInterface } from "./Listable";

export interface ListSourceInterface {
  id: string;
  url?: string;
  items?: Array<EntityInterface>;
  entityTypeId?: string;
  bundle?: string;
  browser: boolean;
  hasData(): boolean;
  refresh(): Promise<ListSourceInterface>;
}

export class ListSource implements ListSourceInterface, ListableInterface {
  id: string;
  bundle: string;

  _url?: JSONApiUrl;

  _items: Array<EntityInterface>;

  entityTypeId: string;

  abortController: AbortController;

  browser: boolean;

  constructor(incoming: ListSourceInterface) {
    if (incoming) {
      Object.assign(this, incoming);
    }
    this.browser = false;
    this.abortController = new AbortController();
    console.debug("list Source Constructor", this);
  }

  get url(): string {
    return this._url.toString() ?? null;
  }

  set url(incoming: string) {
    this._url = new JSONApiUrl(incoming);
  }

  updateQuery(newQuery: URLSearchParams): Promise<Array<any>> {
    this._url.query = newQuery;
    return this.getSourceData();
  }

  hasData(): boolean {
    // if Items is undefined, the first call has not been made
    return Array.isArray(this.items);
  }

  public static clone(incoming: ListSourceInterface): ListSource {
    if (incoming instanceof ListSource) {
      return new ListSource(incoming.toObject());
    }
    return new ListSource(incoming);
  }

  async refresh(url: JSONApiUrl = null): Promise<ListSource> {
    // if you don't get a new URL, use the one you have
    console.debug("refresh called!", this, url);
    const toSend = url instanceof JSONApiUrl ? url : this._url;
    const self = this;
    return fetch(toSend.toString(), { signal: this.abortController.signal })
      .then((res) => res.json())
      .then((ajaxData) => {
        console.debug("back from jsonapi", ajaxData);
        const theClone = self.clone();
        console.debug("THE CLONED DATA:", theClone);
        theClone.addItems(ajaxData.data);
        return theClone;
      })
      .catch((e) => {
        console.error(`Fetch 1 error: ${e.message}`);
        throw new Error("Error fetching items for list: ".concat(e.message));
      });
  }

  get items(): Array<EntityInterface> {
    return this._items;
  }

  set items(incoming: Array<EntityInterface>) {
    this._items = incoming;
  }

  addItems(incoming: Array<EntityInterface>) {
    if (!Array.isArray(this._items)) {
      this._items = [];
    }
    this._items.push(...incoming);
  }

  toObject(): ListSourceInterface {
    return {
      id: this.id,
      url: this.url,
      items: this.items,
      entityTypeId: this.entityTypeId,
      bundle: this.bundle,
    };
  }

  getInstance(...args: any[]) {
    const instance = Object.create(Object.getPrototypeOf(this));
    instance.constructor.apply(instance, args);
    return instance;
  }
}

export default ListSource;
