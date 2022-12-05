
export function AddProposal() {
  return (
    <>
    <div className="flex justify-center">
      <div className="w-1/2 flex flex-col pb-12">

        <textarea
          placeholder="Propose description"
          className="mt-2 border rounded p-4"
          onChange={e => updateFormInput({ ...formInput, description: e.target.value })}
        />

        <button >
          Create Proposal
        </button>
      </div>
    </div>
    </>
  )
}