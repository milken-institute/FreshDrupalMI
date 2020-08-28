

class MilkenOpportunityDetail extends HTMLElement {


  template: HTMLTemplateElement;
  container: HTMLElement;
  menuReveal: HTMLElement;

  showHide(evt = null) {
    console.log(this.container);

    this.container.style.display =  (this.container.style.display == "none") ? "block" : "none";
  }

  constructor() {
    super();
    const shadowRoot = this.attachShadow({mode: 'open'});
    this.template = document.createElement('template');
    this.template.innerHTML = `
      <div class="container-fluid">
        <div class="row">
          <div class="col">
            <h6>Field_actions</h6>
            <slot name="field_actions"></slot>
            <h6>Field Body</h6>
            <slot name="field_body"></slot>
            <h6>Field Focus</h6>
            <slot name="field_focus"></slot>
            <h6>Field hub</h6>
            <slot name="field_hub"></slot>
            <h6>Field Regopm</h6>
            <slot name="field_region"></slot>
            <h6>Field terms</h6>
            <slot name="field_terms"></slot>
            <h6>Field url</h6>
            <slot name="field_url"></slot>
          </div>
        </div>
      </div>
    `;
    shadowRoot.appendChild(this.template.content.cloneNode(true));
  }
}



customElements.define('opportunity-detail', MilkenOpportunityDetail);

export default MilkenOpportunityDetail;
