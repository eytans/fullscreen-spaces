EXTENSION_NAME := fullscreen-space@singher.co.il
DIST_DIR := dist
VM_USER := e
VM_HOST := gnome-test
SSH_DEST := $(VM_USER)@$(VM_HOST)
VM_NAME := gnome-test

.PHONY: all clean pack install vm-start vm-deploy

all: install

$(DIST_DIR):
	mkdir -p $(DIST_DIR)

clean:
	rm -rf $(DIST_DIR)

pack: $(DIST_DIR)
	gnome-extensions pack \
		--force \
		--out-dir=$(DIST_DIR)

install: pack
	-gnome-extensions uninstall $(EXTENSION_NAME)
	gnome-extensions install $(DIST_DIR)/$(EXTENSION_NAME).shell-extension.zip

# VM operations
vm-start:
	@if ! virsh list --all | grep -q $(VM_NAME); then \
		echo "VM $(VM_NAME) not found"; \
		exit 1; \
	fi
	@if ! virsh list | grep -q $(VM_NAME); then \
		echo "Starting VM $(VM_NAME)..."; \
		virsh start $(VM_NAME); \
		echo "Waiting for VM to boot..."; \
		sleep 10; \
	fi

vm-deploy: pack vm-start
	scp $(DIST_DIR)/$(EXTENSION_NAME).shell-extension.zip $(SSH_DEST):/tmp/
	ssh $(SSH_DEST) "gnome-extensions install --force /tmp/$(EXTENSION_NAME).shell-extension.zip && \
		gnome-extensions enable $(EXTENSION_NAME) && \
		loginctl terminate-user $(VM_USER)"; \
	EXIT_CODE=$$?; \
	if [ $$EXIT_CODE -eq 255 ]; then \
		echo "User logged out successfully (expected error 255)"; \
		exit 0; \
	elif [ $$EXIT_CODE -ne 0 ]; then \
		echo "Unexpected error: $$EXIT_CODE"; \
		exit $$EXIT_CODE; \
	fi
	@echo "Extension deployed and session restarted"
	@echo "VM is ready for testing at $(VM_HOST)"