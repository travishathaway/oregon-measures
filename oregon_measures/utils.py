import re


def parse_bulk_update_text(text: str) -> list:
    """
    Parses a text field returning a list of integers

    Example:
        >>> text = '123,123\\n123,123\\n123,123'
        >>> parsed = parse_bulk_update_text(text)
        >>> parsed
        ... [123123, 123123, 123123]
    """
    parse_list = []
    prog = re.compile(r'[^0-9]')

    for row in text.split('\n'):
        if row:
            number = prog.sub('', row)
            if number:
                parse_list.append(int(number))

    return parse_list
