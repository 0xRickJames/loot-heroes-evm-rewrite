import React, { ReactElement, useEffect, useState } from "react"
import { asError, Errors, GenericError } from "../../../library/errors"
import InteractiveButton from "../../Widget/InteractiveButton"
import ModalContainer from "../../Widget/ModalContainer"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faCheckCircle,
  faCircleExclamation,
  faCircleNotch,
} from "@fortawesome/free-solid-svg-icons"

export interface WalletOperationStep {
  title: string
  description: string
  successMessage?: React.FC<SuccessResult>
  action: (previousResult: any) => Promise<any>
}

export interface WalletOperationProps {
  title: ReactElement
  intro: ReactElement
  steps: WalletOperationStep[]
  toggle: boolean
  success: ReactElement
  closeCallback: () => void
}

export interface SuccessResult {
  result: any
}

export const WalletOperation: React.FC<WalletOperationProps> = (
  props: WalletOperationProps
) => {
  const [currentStep, setCurrentStep] = useState<WalletOperationStep>()
  const [pendingSteps, setPendingSteps] = useState<number>(0)
  const [completedSteps, setCompletedSteps] = useState<WalletOperationStep[]>(
    []
  )
  const [finished, setFinished] = useState<boolean>(false)
  const [transitioningStep, setTransitioningStep] = useState<boolean>(false)
  const [executingStep, setExecutingStep] = useState(false)
  const [hasErrored, setHasErrored] = useState(false)
  const [errorDetails, setErrorDetails] = useState<string>()
  const [isOpen, setIsOpen] = useState<boolean>()
  const [previousResult, setPreviousResult] = useState<any>()
  const [showingSuccessMessage, setShowingSuccessMessage] = useState<boolean>()

  useEffect(() => {
    if (!pendingSteps && pendingSteps) {
      setPendingSteps(props.steps.length)
    }
    setIsOpen(props.toggle)
  }, [props.steps, props.toggle])

  const executeStep = async () => {
    setHasErrored(false)
    setErrorDetails(undefined)

    if (finished) {
      return
    }

    if (!currentStep) {
      return
    }

    setExecutingStep(true)

    try {
      let result = await currentStep.action(previousResult)
      setPreviousResult(result)
    } catch (e) {
      let errorMessage = asError(e).message || asError(e).name

      setExecutingStep(false)
      setErrorDetails(errorMessage ? errorMessage : e + "")
      setHasErrored(true)

      return
    }

    setCompletedSteps([...completedSteps, currentStep])
    setPendingSteps(pendingSteps - 1)

    if (!currentStep.successMessage) {
      setTransitioningStep(true)
    } else {
      setShowingSuccessMessage(true)
    }
  }

  const close = async () => {
    setIsOpen(false)
    props.closeCallback()
  }

  const onTransitionCompleted = async () => {
    if (isOpen) {
      return
    }

    setPreviousResult(undefined)
    setPendingSteps(0)
    setHasErrored(false)
    setCompletedSteps([])
    setFinished(false)
    setTransitioningStep(false)
    setExecutingStep(false)
    setErrorDetails("")
    setCurrentStep(undefined)
  }

  const transitionStep = async () => {
    setExecutingStep(false)

    if (pendingSteps < 1) {
      setFinished(true)
      setCurrentStep(undefined)
    } else {
      setCurrentStep(props.steps[props.steps.length - pendingSteps])
    }

    setShowingSuccessMessage(false)
    setSuccessMessage(undefined)
    setTransitioningStep(false)
  }

  const [successMessage, setSuccessMessage] = useState<any>()

  return (
    <ModalContainer
      size="lg"
      active={isOpen}
      onTransitionEnd={onTransitionCompleted}
    >
      <div className="w-full p-4">
        <div className="flex flex-row-reverse">
          <button onClick={close}>Close</button>
        </div>
        <div className="text-3xl text-center mb-5">{props.title}</div>
        <div className="text-white text-center text-2xl">
          {finished ? (
            <>
              <FontAwesomeIcon
                className="mb-8"
                icon={faCheckCircle}
                size="3x"
              />
              <p className="mb-4">{props.success}</p>
              <p>
                <InteractiveButton onClick={close}>Close</InteractiveButton>
              </p>
            </>
          ) : currentStep ? (
            <>
              <div
                className={`alert alert-success ${
                  transitioningStep ? "alert-hidden" : "alert-show"
                }`}
                onTransitionEnd={async () => {
                  if (successMessage) {
                    setTransitioningStep(true)
                    setSuccessMessage(false)
                    await transitionStep()
                    return
                  }

                  if (currentStep?.successMessage) {
                    setSuccessMessage(true)
                    return
                  }

                  await transitionStep()
                }}
              >
                {!showingSuccessMessage ? (
                  <div>
                    <h3>{currentStep.description}</h3>
                  </div>
                ) : (
                  <></>
                )}
                <div className="m-8">
                  {executingStep ? (
                    <>
                      {!showingSuccessMessage ? (
                        <FontAwesomeIcon icon={faCircleNotch} spin size="3x" />
                      ) : (
                        <></>
                      )}

                      {successMessage &&
                      showingSuccessMessage &&
                      currentStep.successMessage ? (
                        <>
                          <div>
                            {React.createElement(currentStep?.successMessage, {
                              result: previousResult,
                            })}
                          </div>
                          <div className={"mt-4"}>
                            <InteractiveButton onClick={transitionStep}>
                              Continue
                            </InteractiveButton>
                          </div>
                        </>
                      ) : (
                        <></>
                      )}
                    </>
                  ) : hasErrored ? (
                    <>
                      <FontAwesomeIcon icon={faCircleExclamation} size="3x" />
                      <div className="mt-4">
                        <p>
                          An error has ocurred! Please take a look at the
                          message below. If you still have issues, come over to
                          website-help and we&apos;ll be able to help you!
                        </p>
                        <p className="bg-gray-900 text-left pre p-4 mt-8">
                          {errorDetails}
                        </p>
                        <p className="mt-4">
                          <InteractiveButton onClick={close}>
                            Close and refresh
                          </InteractiveButton>
                        </p>
                      </div>
                    </>
                  ) : (
                    <InteractiveButton onClick={executeStep}>
                      {currentStep.title}
                    </InteractiveButton>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="text-2xl">
              <div className="mb-8">{props.intro}</div>
              <InteractiveButton onClick={() => setCurrentStep(props.steps[0])}>
                Start!
              </InteractiveButton>
            </div>
          )}
        </div>
      </div>
    </ModalContainer>
  )
}
