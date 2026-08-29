in simple_response
    await self.app(scope, receive, send)
  File "C:\Users\muham\AppData\Local\Programs\Python\Python313\Lib\site-packages\starlette\middleware\exceptions.py", line 62, in __call__
    await wrap_app_handling_exceptions(self.app, conn)(scope, receive, send)
  File "C:\Users\muham\AppData\Local\Programs\Python\Python313\Lib\site-packages\starlette\_exception_handler.py", line 64, in wrapped_app
    raise exc
  File "C:\Users\muham\AppData\Local\Programs\Python\Python313\Lib\site-packages\starlette\_exception_handler.py", line 53, in wrapped_app
    await app(scope, receive, sender)
  File "C:\Users\muham\AppData\Local\Programs\Python\Python313\Lib\site-packages\starlette\routing.py", line 758, in __call__
    await self.middleware_stack(scope, receive, send)
  File "C:\Users\muham\AppData\Local\Programs\Python\Python313\Lib\site-packages\starlette\routing.py", line 778, in app
    await route.handle(scope, receive, send)
  File "C:\Users\muham\AppData\Local\Programs\Python\Python313\Lib\site-packages\starlette\routing.py", line 299, in handle
    await self.app(scope, receive, send)
  File "C:\Users\muham\AppData\Local\Programs\Python\Python313\Lib\site-packages\starlette\routing.py", line 79, in app
    await wrap_app_handling_exceptions(app, request)(scope, receive, send)
  File "C:\Users\muham\AppData\Local\Programs\Python\Python313\Lib\site-packages\starlette\_exception_handler.py", line 64, in wrapped_app
    raise exc
  File "C:\Users\muham\AppData\Local\Programs\Python\Python313\Lib\site-packages\starlette\_exception_handler.py", line 53, in wrapped_app
    await app(scope, receive, sender)
  File "C:\Users\muham\AppData\Local\Programs\Python\Python313\Lib\site-packages\starlette\routing.py", line 74, in app
    response = await func(request)
               ^^^^^^^^^^^^^^^^^^^
  File "C:\Users\muham\AppData\Local\Programs\Python\Python313\Lib\site-packages\fastapi\routing.py", line 278, in app
    raw_response = await run_endpoint_function(
                   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^
        dependant=dependant, values=values, is_coroutine=is_coroutine
        ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    )
    ^
  File "C:\Users\muham\AppData\Local\Programs\Python\Python313\Lib\site-packages\fastapi\routing.py", line 191, in run_endpoint_function
    return await dependant.call(**values)
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "E:\Courses\AI_Development\Phase 0 — Data Science Environment\Healthcare Appointment Intelligence System\backend\app\routes\appointments.py", line 109, in create_appointment_endpoint
    detail = await get_appointment_detail(db, str(inserted_id))
             ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "E:\Courses\AI_Development\Phase 0 — Data Science Environment\Healthcare Appointment Intelligence System\backend\app\services\appointment_service.py", line 138, in get_appointment_detail
    patient = await db["patients"].find_one({"_id": ObjectId(appointment["patient_id"])})
                                                    ~~~~~~~~^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\muham\AppData\Local\Programs\Python\Python313\Lib\site-packages\bson\objectid.py", line 116, in __init__
    _raise_invalid_id(oid)
    ~~~~~~~~~~~~~~~~~^^^^^
  File "C:\Users\muham\AppData\Local\Programs\Python\Python313\Lib\site-packages\bson\objectid.py", line 37, in _raise_invalid_id
    raise InvalidId(
    ...<2 lines>...
    )
bson.errors.InvalidId: 'P89890' is not a valid ObjectId, it must be a 12-byte input or a 24-character hex string
INFO:     127.0.0.1:56298 - "POST /api/appointments HTTP/1.1" 500 Internal Server Error
ERROR:    Exception in ASGI application
Traceback (most recent call last):
  File "C:\Users\muham\AppData\Local\Programs\Python\Python313\Lib\site-packages\uvicorn\protocols\http\httptools_impl.py", line 419, in run_asgi
    result = await app(  # type: ignore[func-returns-value]
             ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
        self.scope, self.receive, self.send
        ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    )
    ^
  File "C:\Users\muham\AppData\Local\Programs\Python\Python313\Lib\site-packages\uvicorn\middleware\proxy_headers.py", line 84, in __call__
    return await self.app(scope, receive, send)
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\muham\AppData\Local\Programs\Python\Python313\Lib\site-packages\fastapi\applications.py", line 1054, in __call__
    await super().__call__(scope, receive, send)
  File "C:\Users\muham\AppData\Local\Programs\Python\Python313\Lib\site-packages\starlette\applications.py", line 123, in __call__
    await self.middleware_stack(scope, receive, send)
  File "C:\Users\muham\AppData\Local\Programs\Python\Python313\Lib\site-packages\starlette\middleware\errors.py", line 186, in __call__
    raise exc
  File "C:\Users\muham\AppData\Local\Programs\Python\Python313\Lib\site-packages\starlette\middleware\errors.py", line 164, in __call__
    await self.app(scope, receive, _send)
  File "C:\Users\muham\AppData\Local\Programs\Python\Python313\Lib\site-packages\starlette\middleware\cors.py", line 91, in __call__
    await self.simple_response(scope, receive, send, request_headers=headers)
  File "C:\Users\muham\AppData\Local\Programs\Python\Python313\Lib\site-packages\starlette\middleware\cors.py", line 146, in simple_response
    await self.app(scope, receive, send)
  File "C:\Users\muham\AppData\Local\Programs\Python\Python313\Lib\site-packages\starlette\middleware\exceptions.py", line 62, in __call__
    await wrap_app_handling_exceptions(self.app, conn)(scope, receive, send)
  File "C:\Users\muham\AppData\Local\Programs\Python\Python313\Lib\site-packages\starlette\_exception_handler.py", line 64, in wrapped_app
    raise exc
  File "C:\Users\muham\AppData\Local\Programs\Python\Python313\Lib\site-packages\starlette\_exception_handler.py", line 53, in wrapped_app
    await app(scope, receive, sender)
  File "C:\Users\muham\AppData\Local\Programs\Python\Python313\Lib\site-packages\starlette\routing.py", line 758, in __call__
    await self.middleware_stack(scope, receive, send)
  File "C:\Users\muham\AppData\Local\Programs\Python\Python313\Lib\site-packages\starlette\routing.py", line 778, in app
    await route.handle(scope, receive, send)
  File "C:\Users\muham\AppData\Local\Programs\Python\Python313\Lib\site-packages\starlette\routing.py", line 299, in handle
    await self.app(scope, receive, send)
  File "C:\Users\muham\AppData\Local\Programs\Python\Python313\Lib\site-packages\starlette\routing.py", line 79, in app
    await wrap_app_handling_exceptions(app, request)(scope, receive, send)
  File "C:\Users\muham\AppData\Local\Programs\Python\Python313\Lib\site-packages\starlette\_exception_handler.py", line 64, in wrapped_app
    raise exc
  File "C:\Users\muham\AppData\Local\Programs\Python\Python313\Lib\site-packages\starlette\_exception_handler.py", line 53, in wrapped_app
    await app(scope, receive, sender)
  File "C:\Users\muham\AppData\Local\Programs\Python\Python313\Lib\site-packages\starlette\routing.py", line 74, in app
    response = await func(request)
               ^^^^^^^^^^^^^^^^^^^
  File "C:\Users\muham\AppData\Local\Programs\Python\Python313\Lib\site-packages\fastapi\routing.py", line 278, in app
    raw_response = await run_endpoint_function(
                   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^
        dependant=dependant, values=values, is_coroutine=is_coroutine
        ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    )
    ^
  File "C:\Users\muham\AppData\Local\Programs\Python\Python313\Lib\site-packages\fastapi\routing.py", line 191, in run_endpoint_function
    return await dependant.call(**values)
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "E:\Courses\AI_Development\Phase 0 — Data Science Environment\Healthcare Appointment Intelligence System\backend\app\routes\appointments.py", line 109, in create_appointment_endpoint
    detail = await get_appointment_detail(db, str(inserted_id))
             ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "E:\Courses\AI_Development\Phase 0 — Data Science Environment\Healthcare Appointment Intelligence System\backend\app\services\appointment_service.py", line 138, in get_appointment_detail
    patient = await db["patients"].find_one({"_id": ObjectId(appointment["patient_id"])})
                                                    ~~~~~~~~^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\muham\AppData\Local\Programs\Python\Python313\Lib\site-packages\bson\objectid.py", line 116, in __init__
    _raise_invalid_id(oid)
    ~~~~~~~~~~~~~~~~~^^^^^
  File "C:\Users\muham\AppData\Local\Programs\Python\Python313\Lib\site-packages\bson\objectid.py", line 37, in _raise_invalid_id
    raise InvalidId(
    ...<2 lines>...
    )
bson.errors.InvalidId: 'P89890' is not a valid ObjectId, it must be a 12-byte input or a 24-character hex string
