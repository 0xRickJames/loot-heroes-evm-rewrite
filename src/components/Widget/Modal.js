import ModalHeader from "@material-tailwind/react/components/Dialog/DialogHeader"
import ModalBody from "@material-tailwind/react/components/Dialog/DialogBody"
import ModalFooter from "@material-tailwind/react/components/Dialog/DialogFooter"
import Button from "@material-tailwind/react/components/Button"
import React from "react"
import { Dialog } from "@material-tailwind/react"

function ModalGeneric(props) {
  return (
    <>
      <Dialog
        size="lg"
        active={props.showModal}
        toggler={() => props.setShowModal(false)}
        className="h-screen"
      >
        <ModalHeader toggler={() => props.setShowModal(false)}>
          Coming Soon!
        </ModalHeader>
        <ModalBody>
          <p className="text-2xl leading-relaxed text-black">
            We are working hard on it!
          </p>
        </ModalBody>
        <ModalFooter>
          <Button
            color="red"
            buttonType="link"
            onClick={(e) => props.setShowModal(false)}
            ripple="dark"
          >
            Close
          </Button>
        </ModalFooter>
      </Dialog>
    </>
  )
}

export default ModalGeneric
