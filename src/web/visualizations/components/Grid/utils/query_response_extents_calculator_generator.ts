import { extent } from 'd3-array'
import { Cell, Data, PivotCell, Row } from 'web/visualizations/types/query_response'

export class QueryResponseExtentsCalculator {
  static ROW_TOTAL_FLAG = '$$$_row_total_$$$'
  fields: string[]
  data: Data
  columnTotals?: Row
  subtotals?: Data[]
  pivoted?: boolean
  includeTotals?: boolean
  includeNulls?: boolean
  dataValues: number[] = []
  fieldsMap: {[key: string]: boolean}
  constructor (fields: string[], data: Data, columnTotals: Row | undefined, pivoted: boolean | undefined, includeTotals: boolean | undefined, includeNulls: boolean | undefined, subtotals?: Data[]) {
    this.fields = fields
    this.data = data
    this.columnTotals = columnTotals
    this.subtotals = subtotals
    this.pivoted = pivoted
    this.includeTotals = includeTotals
    this.includeNulls = includeNulls
    this.fieldsMap = this._getFieldsMap()
  }

    // new function that returns all the values for given query response
  aggregateData () {
    for (const data of this.data) {
      const datums = Object.keys(data).reduce((newData, key) => {
        if (this.fieldsMap.hasOwnProperty(key)) {
          newData[key] = data[key]
        }
        return newData
      }, {} as PivotCell | Cell)
      for (const key in datums) {
        const val = datums[key]
        if (this.pivoted) {
          if (!this._addValueIfNumericOrNull(val !== null ? val.value : undefined)) {
            this._addPivotedValues(val)
          }
        } else {
          this._addValueIfNumericOrNull(val !== null ? val.value : undefined)
        }
      }
    }

    this._addColumnTotalValues()
    return this.dataValues
  }

  getExtents () {
    for (const data of this.data) {
      const datums = Object.keys(data).reduce((newData, key) => {
        if (this.fieldsMap.hasOwnProperty(key)) {
          newData[key] = data[key]
        }
        return newData
      }, {} as PivotCell | Cell)
      for (const key in datums) {
        const val = datums[key]
        if (this.pivoted && val) {
          if (!this._addValueIfNumericOrNull(val.value)) {
            this._addPivotedValues(val)
          }
        } else if (val) {
          this._addValueIfNumericOrNull(val.value)
        }
      }
    }

    this._addColumnTotalValues()
    return extent(this.dataValues)
  }

  _addValueIfNumericOrNull (value: any) {
    if ((typeof value === 'number') || (value === null)) {
      this._addDataValue(value)
      return true
    }
    return false
  }

  _addPivotedValues (pivotedData: PivotCell) {
    Object.keys(pivotedData).forEach((key) => {
      const val = pivotedData[key]
      if ((val && key !== QueryResponseExtentsCalculator.ROW_TOTAL_FLAG) || this.includeTotals) {
        this._addDataValue(val.value)
      }
    })
  }

  _addColumnTotalValues () {
    let key, val
    if (!this.includeTotals) { return }
    if (this.columnTotals) {
      for (const field in this.columnTotals) {
        const total = this.columnTotals[field]
        if (!this.fieldsMap[field]) { continue }
        if (!total) { continue }
        if (!this._addValueIfNumericOrNull(total.value)) {
          for (key in total) {
            val = total[key]
            this._addDataValue(val != null ? val.value : undefined)
          }
        }
      }
    }

    if (this.subtotals) {
      for (const _key in this.subtotals) {
        const subtotalSet = this.subtotals[_key]
        subtotalSet.forEach((row) => {
          for (const fieldName in row) {
            const cellOrPivotCell = row[fieldName]
            if (!this.fieldsMap[fieldName]) { continue }
            if (!this._addValueIfNumericOrNull(cellOrPivotCell.value)) {
              for (key in cellOrPivotCell) {
                val = cellOrPivotCell[key]
                this._addDataValue(val != null ? val.value : undefined)
              }
            }
          }
        })
      }
    }
  }

  _addDataValue (value: any) {
    if ((value === null) && this.includeNulls) {
      this.dataValues.push(0)
    } else {
      this.dataValues.push(value)
    }
  }

  _getFieldsMap () {
    const fieldsMap = {} as any
    for (const field of this.fields) {
      fieldsMap[field] = true
    }
    return fieldsMap
  }
}
