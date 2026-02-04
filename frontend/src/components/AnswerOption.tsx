import { OptionKey } from '../types'

interface AnswerOptionProps {
  optionKey: OptionKey
  text: string
  isSelected: boolean
  onSelect: (key: OptionKey) => void
}

export function AnswerOption({
  optionKey,
  text,
  isSelected,
  onSelect
}: AnswerOptionProps) {
  return (
    <label
      className={`exam-protected flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all ${
        isSelected
          ? 'bg-frcr-teal-50 border-2 border-frcr-teal-500'
          : 'bg-white border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
      }`}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Checkbox */}
      <div className="flex-shrink-0 mt-0.5">
        <div
          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
            isSelected
              ? 'bg-frcr-teal-600 border-frcr-teal-600'
              : 'border-gray-400 bg-white'
          }`}
        >
          {isSelected && (
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          )}
        </div>
      </div>

      {/* Option label and text */}
      <div className="flex-1">
        <span className="font-medium text-gray-500 mr-2">{optionKey}.</span>
        <span className={isSelected ? 'text-frcr-teal-800' : 'text-gray-700'}>
          {text}
        </span>
      </div>

      {/* Hidden input for accessibility */}
      <input
        type="radio"
        name="answer"
        value={optionKey}
        checked={isSelected}
        onChange={() => onSelect(optionKey)}
        className="sr-only"
      />
    </label>
  )
}
