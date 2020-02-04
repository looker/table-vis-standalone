import _escape from 'lodash/escape'
import includes from 'lodash/includes'

// import { LookmlModelExploreField as Field } from '../../../lib/helltool/assets/core_api/types/lookml_model_explore_field'
import {Cell, FilterData, Link, Field } from 'web/visualizations/types/query_response'

function checkLinks(c: Cell) {
  if (!c.links) {
    return false
  }
  return c.links.some(
    (link: Link) =>
      link.type === 'url' || link.type === 'dashboard' || link.type === 'action'
  )
}

export class PublicCellUtils {
  static textForCell(cell: Cell) {
    if (cell.value !== null) {
      return cell.rendered || `${cell.value}`
    } else {
      return '∅'
    }
  }

  static filterableValueForCell(cell: Cell) {
    return cell.filterable_value || `${cell.value}`
  }

  /**
   * Obsolete. Used for assets or any visualizations required in assets, for
   * dashboards-next components please use cellToHtml method.
   *
   * Given a particular cell, return safely injectable HTML. This method serves as the central point of enforcement
   * of sanitization for rendering field values
   *
   * If a cell has an html property, the assumption is that it has been sanitized by the backend.
   * See Looker::Utils::HTMLSanitizer and run "rake dump_html_whitelist" to view the list of all supported HTML tags
   *
   * Also see https://docs.looker.com/reference/field-params/html
   */
  static htmlForCell(
    cell: Cell,
    context?: string,
    fieldDefinitionForCell?: Field,
    customHtml?: string
  ) {
    let drillable: boolean = false
    let filterData: FilterData | undefined
    let html

    if (cell.links) {
      drillable = cell.links.length > 0
    } else {
      drillable = !!fieldDefinitionForCell
    }

    if (customHtml) {
      html = customHtml
    } else if (cell.html) {
      html = cell.html
    } else {
      let generated = _escape(this.textForCell(cell))

      if (cell.value === null) {
        generated = `<span class='null'>${generated}</span>`
      }

      if (drillable) {
        // Use the anchor "#drillmenu" if there's no default drill for the cell but there *are* links
        html = `<a href='#drillmenu' class='cell-clickable-content' target='_self'>${generated}</a>`
      } else {
        html = generated
      }
    }
    html = `<span class='drillable-item-content'>${html}</span>`

    if (checkLinks(cell)) {
      const baubleHtml = `<a class='drill-menu-bauble cell-clickable-content'><span class='cell-clickable-content'>...</span></a>`
      html = `${html}<span class='drillable-item-icon-wrapper'>&nbsp;${baubleHtml}</span>`
    }

    if (
      fieldDefinitionForCell &&
      fieldDefinitionForCell.can_filter &&
      !fieldDefinitionForCell.measure
    ) {
      filterData = {
        add: this.filterableValueForCell(cell),
        field: fieldDefinitionForCell.name,
        rendered: this.textForCell(cell),
      }
    }

    return `<span class='drillable-item' data-links='${_escape(
      JSON.stringify(cell.links)
    )}' data-context='${_escape(
      context || ''
    )}' data-add-filter-json='${_escape(
      JSON.stringify(filterData)
    )}'>${html}</span>`
  }

  /**
   * Given a particular cell, return safely injectable HTML. This method serves as the central point of enforcement
   * of sanitization for rendering field values
   *
   * If a cell has an html property, the assumption is that it has been sanitized by the backend.
   * See Looker::Utils::HTMLSanitizer and run "rake dump_html_whitelist" to view the list of all supported HTML tags
   *
   * Also see https://docs.looker.com/reference/field-params/html
   * @param cell
   */
  static cellToHtml(cell: Cell, customText = '') {
    let html
    if (cell.html) {
      html = cell.html
    } else {
      html = _escape(customText || this.textForCell(cell))
      if (cell.links && cell.links.length > 0) {
        html = `<a href='#drillmenu' class='cell-clickable-content'>${html}</a>`
        const baubleTypes = ['url', 'dashboard', 'action']
        if (cell.links.some(link => includes(baubleTypes, link.type))) {
          html = `${html}<span class='drillable-item-icon-wrapper'>&nbsp;<a class='drill-menu-bauble cell-clickable-content'><span>...</span></a></span>`
        }
      }
    }

    return html
  }

  static totalCellToHtml(value: string, link: string) {
    return `<a href='${link}' target='_self'>${value}</a>`
  }
}
